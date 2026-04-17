import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { TaskPriority } from './dto/task-priority.enum';
import { TaskStatus } from './dto/task-status.enum';

const mockTaskService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  updateStatus: jest.fn(),
  getStats: jest.fn(),
};

const baseTask = {
  id: '1',
  hospitalId: 'h1',
  title: 'Revisión equipos',
  status: TaskStatus.PENDING,
  priority: TaskPriority.HIGH,
};

describe('TaskController', () => {
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskService, useValue: mockTaskService }],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    jest.clearAllMocks();
  });

  describe('POST /hospital/:hospitalId/task', () => {
    it('should call service.create with hospitalId and dto', async () => {
      const dto: CreateTaskDto = {
        title: 'Revisión equipos',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
      };

      mockTaskService.create.mockResolvedValue(baseTask);

      const result = await controller.create('h1', dto);

      expect(mockTaskService.create).toHaveBeenCalledWith('h1', dto);
      expect(result).toEqual(baseTask);
    });
  });

  describe('GET /hospital/:hospitalId/task', () => {
    it('should call service.findAll with hospitalId and empty filters', async () => {
      mockTaskService.findAll.mockResolvedValue([baseTask]);

      const result = await controller.findAll('h1', {});

      expect(mockTaskService.findAll).toHaveBeenCalledWith('h1', {});
      expect(result).toEqual([baseTask]);
    });

    it('should forward query filters to service.findAll', async () => {
      const filters: FilterTaskDto = { status: TaskStatus.PENDING, priority: TaskPriority.HIGH };
      mockTaskService.findAll.mockResolvedValue([baseTask]);

      await controller.findAll('h1', filters);

      expect(mockTaskService.findAll).toHaveBeenCalledWith('h1', filters);
    });
  });

  describe('GET /hospital/:hospitalId/task/:id', () => {
    it('should call service.findOne with hospitalId and id', async () => {
      mockTaskService.findOne.mockResolvedValue(baseTask);

      const result = await controller.findOne('h1', '1');

      expect(mockTaskService.findOne).toHaveBeenCalledWith('h1', '1');
      expect(result).toEqual(baseTask);
    });
  });

  describe('PATCH /hospital/:hospitalId/task/:id', () => {
    it('should call service.update with hospitalId, id and dto', async () => {
      const dto: UpdateTaskDto = { title: 'Revisión equipos actualizada' };
      const updated = { ...baseTask, title: 'Revisión equipos actualizada' };

      mockTaskService.update.mockResolvedValue(updated);

      const result = await controller.update('h1', '1', dto);

      expect(mockTaskService.update).toHaveBeenCalledWith('h1', '1', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('DELETE /hospital/:hospitalId/task/:id', () => {
    it('should call service.remove with hospitalId and id', async () => {
      mockTaskService.remove.mockResolvedValue(undefined);

      await controller.remove('h1', '1');

      expect(mockTaskService.remove).toHaveBeenCalledWith('h1', '1');
    });
  });

  describe('PATCH /hospital/:hospitalId/task/:id/status', () => {
    it('should call service.updateStatus with hospitalId, id and new status', async () => {
      const dto = { status: TaskStatus.IN_PROGRESS };
      const updated = { ...baseTask, status: TaskStatus.IN_PROGRESS };

      mockTaskService.updateStatus.mockResolvedValue(updated);

      const result = await controller.updateStatus('h1', '1', dto as UpdateTaskStatusDto);

      expect(mockTaskService.updateStatus).toHaveBeenCalledWith('h1', '1', TaskStatus.IN_PROGRESS);
      expect(result).toEqual(updated);
    });
  });

  describe('GET /hospital/:hospitalId/task/stats', () => {
    it('should call service.getStats with hospitalId and return count+percentage per status', async () => {
      const stats = {
        [TaskStatus.PENDING]:     { count: 3, percentage: 75 },
        [TaskStatus.IN_PROGRESS]: { count: 1, percentage: 25 },
        [TaskStatus.COMPLETED]:   { count: 0, percentage: 0 },
        [TaskStatus.CANCELLED]:   { count: 0, percentage: 0 },
      };

      mockTaskService.getStats.mockResolvedValue(stats);

      const result = await controller.getStats('h1');

      expect(mockTaskService.getStats).toHaveBeenCalledWith('h1');
      expect(result).toEqual(stats);
    });
  });
});
