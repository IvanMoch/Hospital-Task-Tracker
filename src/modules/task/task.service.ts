import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { TaskStatus } from './dto/task-status.enum';
import { HospitalService } from '../hospital/hospital.service';

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
  [TaskStatus.COMPLETED]: [],
  [TaskStatus.CANCELLED]: [],
};

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hospitalService: HospitalService,
  ) {}

  async create(hospitalId: string, dto: CreateTaskDto) {
    await this.ensureHospitalExists(hospitalId);
    return this.prisma.task.create({ data: { ...dto, hospitalId } });
  }

  async findAll(hospitalId: string, filters: FilterTaskDto) {
    await this.ensureHospitalExists(hospitalId);
    return this.prisma.task.findMany({
      where: {
        hospitalId,
        deletedAt: null,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
      },
    });
  }

  async findOne(hospitalId: string, id: string) {
    await this.ensureHospitalExists(hospitalId);
    const task = await this.prisma.task.findUnique({
      where: { id, hospitalId, deletedAt: null },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(hospitalId: string, id: string, dto: UpdateTaskDto) {
    await this.findOne(hospitalId, id);
    return this.prisma.task.update({ where: { id }, data: dto });
  }

  async remove(hospitalId: string, id: string) {
    await this.findOne(hospitalId, id);
    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateStatus(hospitalId: string, id: string, newStatus: TaskStatus) {
    const task = await this.findOne(hospitalId, id);
    const allowed = VALID_TRANSITIONS[task.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${task.status} to ${newStatus}`,
      );
    }
    return this.prisma.task.update({ where: { id }, data: { status: newStatus } });
  }

  async getStats(hospitalId: string): Promise<Record<TaskStatus, { count: number; percentage: number }>> {
    await this.ensureHospitalExists(hospitalId);
    const rows = await this.prisma.task.groupBy({
      by: ['status'],
      where: { hospitalId, deletedAt: null },
      _count: { status: true },
    });

    const countByStatus = Object.fromEntries(rows.map((r) => [r.status, r._count.status]));
    const total = rows.reduce((sum, r) => sum + r._count.status, 0);

    return Object.values(TaskStatus).reduce(
      (acc, status) => {
        const count = countByStatus[status] ?? 0;
        const percentage = total === 0 ? 0 : Math.round((count / total) * 10000) / 100;
        return { ...acc, [status]: { count, percentage } };
      },
      {} as Record<TaskStatus, { count: number; percentage: number }>,
    );
  }

  private async ensureHospitalExists(hospitalId: string) {
    try {
      await this.hospitalService.findOne(hospitalId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Hospital not found');
      }
      throw error;
    }
  }
}
