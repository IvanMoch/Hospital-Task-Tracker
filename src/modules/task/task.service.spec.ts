import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TaskService } from './task.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { TaskPriority } from './dto/task-priority.enum';
import { TaskStatus } from './dto/task-status.enum';

const mockPrismaService = {
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const baseTask = {
  id: '1',
  hospitalId: 'h1',
  title: 'Revisión equipos',
  description: null,
  status: TaskStatus.PENDING,
  priority: TaskPriority.HIGH,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task under the given hospital', async () => {
      const dto: CreateTaskDto = {
        title: 'Revisión equipos',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
      };

      mockPrismaService.task.create.mockResolvedValue(baseTask);

      const result = await service.create('h1', dto);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: { ...dto, hospitalId: 'h1' },
      });
      expect(result).toEqual(baseTask);
    });
  });

  describe('findAll', () => {
    it('should return only active tasks for the given hospital', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([baseTask]);

      const result = await service.findAll('h1', {});

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { hospitalId: 'h1', deletedAt: null },
      });
      expect(result).toEqual([baseTask]);
    });

    it('should filter by status when provided', async () => {
      const filtered = [{ ...baseTask, status: TaskStatus.IN_PROGRESS }];
      mockPrismaService.task.findMany.mockResolvedValue(filtered);

      const result = await service.findAll('h1', { status: TaskStatus.IN_PROGRESS });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { hospitalId: 'h1', deletedAt: null, status: TaskStatus.IN_PROGRESS },
      });
      expect(result).toEqual(filtered);
    });

    it('should filter by priority when provided', async () => {
      const filtered = [baseTask];
      mockPrismaService.task.findMany.mockResolvedValue(filtered);

      const result = await service.findAll('h1', { priority: TaskPriority.HIGH });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { hospitalId: 'h1', deletedAt: null, priority: TaskPriority.HIGH },
      });
      expect(result).toEqual(filtered);
    });

    it('should filter by both status and priority when provided', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([baseTask]);

      await service.findAll('h1', { status: TaskStatus.PENDING, priority: TaskPriority.HIGH });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        where: { hospitalId: 'h1', deletedAt: null, status: TaskStatus.PENDING, priority: TaskPriority.HIGH },
      });
    });
  });

  describe('findOne', () => {
    it('should return the task if it belongs to the hospital', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(baseTask);

      const result = await service.findOne('h1', '1');

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: '1', hospitalId: 'h1', deletedAt: null },
      });
      expect(result).toEqual(baseTask);
    });

    it('should throw NotFoundException if task does not exist or belongs to another hospital', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('h1', '999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task that belongs to the hospital', async () => {
      const dto: UpdateTaskDto = { status: TaskStatus.COMPLETED };
      const updated = { ...baseTask, status: TaskStatus.COMPLETED };

      mockPrismaService.task.findUnique.mockResolvedValue(baseTask);
      mockPrismaService.task.update.mockResolvedValue(updated);

      const result = await service.update('h1', '1', dto);

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if task does not belong to hospital', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.update('h1', '999', { status: TaskStatus.COMPLETED })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete a task that belongs to the hospital', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(baseTask);
      mockPrismaService.task.update.mockResolvedValue({ ...baseTask, deletedAt: new Date() });

      await service.remove('h1', '1');

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if task does not belong to hospital', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.remove('h1', '999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should transition PENDING → IN_PROGRESS', async () => {
      const task = { ...baseTask, status: TaskStatus.PENDING };
      const updated = { ...task, status: TaskStatus.IN_PROGRESS };

      mockPrismaService.task.findUnique.mockResolvedValue(task);
      mockPrismaService.task.update.mockResolvedValue(updated);

      const result = await service.updateStatus('h1', '1', TaskStatus.IN_PROGRESS);

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: TaskStatus.IN_PROGRESS },
      });
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should transition PENDING → CANCELLED', async () => {
      const task = { ...baseTask, status: TaskStatus.PENDING };
      mockPrismaService.task.findUnique.mockResolvedValue(task);
      mockPrismaService.task.update.mockResolvedValue({ ...task, status: TaskStatus.CANCELLED });

      const result = await service.updateStatus('h1', '1', TaskStatus.CANCELLED);

      expect(result.status).toBe(TaskStatus.CANCELLED);
    });

    it('should transition IN_PROGRESS → COMPLETED', async () => {
      const task = { ...baseTask, status: TaskStatus.IN_PROGRESS };
      mockPrismaService.task.findUnique.mockResolvedValue(task);
      mockPrismaService.task.update.mockResolvedValue({ ...task, status: TaskStatus.COMPLETED });

      const result = await service.updateStatus('h1', '1', TaskStatus.COMPLETED);

      expect(result.status).toBe(TaskStatus.COMPLETED);
    });

    it('should transition IN_PROGRESS → CANCELLED', async () => {
      const task = { ...baseTask, status: TaskStatus.IN_PROGRESS };
      mockPrismaService.task.findUnique.mockResolvedValue(task);
      mockPrismaService.task.update.mockResolvedValue({ ...task, status: TaskStatus.CANCELLED });

      const result = await service.updateStatus('h1', '1', TaskStatus.CANCELLED);

      expect(result.status).toBe(TaskStatus.CANCELLED);
    });

    it('should throw BadRequestException for invalid transition PENDING → COMPLETED', async () => {
      const task = { ...baseTask, status: TaskStatus.PENDING };
      mockPrismaService.task.findUnique.mockResolvedValue(task);

      await expect(service.updateStatus('h1', '1', TaskStatus.COMPLETED)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when COMPLETED task tries to change status', async () => {
      const task = { ...baseTask, status: TaskStatus.COMPLETED };
      mockPrismaService.task.findUnique.mockResolvedValue(task);

      await expect(service.updateStatus('h1', '1', TaskStatus.PENDING)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when CANCELLED task tries to change status', async () => {
      const task = { ...baseTask, status: TaskStatus.CANCELLED };
      mockPrismaService.task.findUnique.mockResolvedValue(task);

      await expect(service.updateStatus('h1', '1', TaskStatus.PENDING)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if task does not belong to hospital', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('h1', '999', TaskStatus.IN_PROGRESS)).rejects.toThrow(NotFoundException);
    });
  });
});
