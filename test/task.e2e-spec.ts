import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { TaskStatus } from './../src/modules/task/dto/task-status.enum';
import { TaskPriority } from './../src/modules/task/dto/task-priority.enum';

type Task = {
  id: string;
  hospitalId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

function createPrismaMock() {
  const tasks = new Map<string, Task>();
  let autoId = 0;
  const nextId = () => `t-${++autoId}`;

  const matches = (task: Task, where: Partial<Task>): boolean =>
    Object.entries(where).every(([k, v]) => (task as Record<string, unknown>)[k] === v);

  return {
    _seed: (task: Partial<Task> & { hospitalId: string }): Task => {
      const full: Task = {
        id: task.id ?? nextId(),
        hospitalId: task.hospitalId,
        title: task.title ?? 'seed',
        description: task.description ?? null,
        status: task.status ?? TaskStatus.PENDING,
        priority: task.priority ?? TaskPriority.MEDIUM,
        createdAt: task.createdAt ?? new Date(),
        updatedAt: task.updatedAt ?? new Date(),
        deletedAt: task.deletedAt ?? null,
      };
      tasks.set(full.id, full);
      return full;
    },
    task: {
      create: jest.fn(async ({ data }: { data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'description'> & { description?: string | null } }) => {
        const task: Task = {
          id: nextId(),
          hospitalId: data.hospitalId,
          title: data.title,
          description: data.description ?? null,
          status: data.status,
          priority: data.priority,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        tasks.set(task.id, task);
        return task;
      }),
      findMany: jest.fn(async ({ where }: { where: Partial<Task> }) =>
        Array.from(tasks.values()).filter((t) => matches(t, where)),
      ),
      findUnique: jest.fn(async ({ where }: { where: Partial<Task> & { id: string } }) => {
        const task = tasks.get(where.id);
        if (!task) return null;
        return matches(task, where) ? task : null;
      }),
      update: jest.fn(async ({ where, data }: { where: { id: string }; data: Partial<Task> }) => {
        const task = tasks.get(where.id);
        if (!task) throw Object.assign(new Error('Record not found'), { code: 'P2025' });
        const updated = { ...task, ...data, updatedAt: new Date() };
        tasks.set(where.id, updated);
        return updated;
      }),
      groupBy: jest.fn(async ({ where }: { where: Partial<Task> }) => {
        const active = Array.from(tasks.values()).filter((t) => matches(t, where));
        const counts = new Map<TaskStatus, number>();
        for (const t of active) counts.set(t.status, (counts.get(t.status) ?? 0) + 1);
        return Array.from(counts.entries()).map(([status, count]) => ({
          status,
          _count: { status: count },
        }));
      }),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
}

describe('Task (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /hospital/:hospitalId/task/stats', () => {
    it('should resolve to getStats and NOT be interpreted as :id', async () => {
      prisma._seed({ hospitalId: 'h1', status: TaskStatus.PENDING });
      prisma._seed({ hospitalId: 'h1', status: TaskStatus.PENDING });
      prisma._seed({ hospitalId: 'h1', status: TaskStatus.IN_PROGRESS });
      prisma._seed({ hospitalId: 'h1', status: TaskStatus.COMPLETED });

      const res = await request(app.getHttpServer())
        .get('/hospital/h1/task/stats')
        .expect(200);

      expect(res.body.data).toEqual({
        [TaskStatus.PENDING]:     { count: 2, percentage: 50 },
        [TaskStatus.IN_PROGRESS]: { count: 1, percentage: 25 },
        [TaskStatus.COMPLETED]:   { count: 1, percentage: 25 },
        [TaskStatus.CANCELLED]:   { count: 0, percentage: 0 },
      });
      expect(prisma.task.groupBy).toHaveBeenCalled();
      expect(prisma.task.findUnique).not.toHaveBeenCalled();
    });

    it('should isolate stats per hospital', async () => {
      prisma._seed({ hospitalId: 'h1', status: TaskStatus.PENDING });
      prisma._seed({ hospitalId: 'h2', status: TaskStatus.COMPLETED });
      prisma._seed({ hospitalId: 'h2', status: TaskStatus.COMPLETED });

      const res = await request(app.getHttpServer())
        .get('/hospital/h2/task/stats')
        .expect(200);

      expect(res.body.data[TaskStatus.COMPLETED]).toEqual({ count: 2, percentage: 100 });
      expect(res.body.data[TaskStatus.PENDING]).toEqual({ count: 0, percentage: 0 });
    });
  });

  describe('Cross-tenant isolation', () => {
    it('GET /hospital/:hospitalId/task/:id returns 404 when task belongs to another hospital', async () => {
      const task = prisma._seed({ hospitalId: 'h1' });

      await request(app.getHttpServer())
        .get(`/hospital/h2/task/${task.id}`)
        .expect(404);
    });

    it('PATCH /hospital/:hospitalId/task/:id returns 404 when task belongs to another hospital', async () => {
      const task = prisma._seed({ hospitalId: 'h1' });

      await request(app.getHttpServer())
        .patch(`/hospital/h2/task/${task.id}`)
        .send({ title: 'Hackeando desde h2' })
        .expect(404);
    });

    it('GET /hospital/:hospitalId/task only returns tasks for that hospital', async () => {
      prisma._seed({ hospitalId: 'h1', title: 'A' });
      prisma._seed({ hospitalId: 'h2', title: 'B' });

      const res = await request(app.getHttpServer())
        .get('/hospital/h1/task')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('A');
    });
  });

  describe('DTO validation', () => {
    it('POST /hospital/:hospitalId/task rejects invalid priority with 400', async () => {
      await request(app.getHttpServer())
        .post('/hospital/h1/task')
        .send({
          title: 'Valid title',
          status: TaskStatus.PENDING,
          priority: 'NOT_A_VALID_PRIORITY',
        })
        .expect(400);
    });

    it('POST /hospital/:hospitalId/task rejects title shorter than 3 chars with 400', async () => {
      await request(app.getHttpServer())
        .post('/hospital/h1/task')
        .send({
          title: 'ab',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
        })
        .expect(400);
    });

    it('PATCH /hospital/:hospitalId/task/:id/status rejects invalid status transition with 400', async () => {
      const task = prisma._seed({ hospitalId: 'h1', status: TaskStatus.PENDING });

      await request(app.getHttpServer())
        .patch(`/hospital/h1/task/${task.id}/status`)
        .send({ status: TaskStatus.COMPLETED })
        .expect(400);
    });
  });

  describe('Response shape', () => {
    it('wraps successful responses in { data, message }', async () => {
      prisma._seed({ hospitalId: 'h1' });

      const res = await request(app.getHttpServer())
        .get('/hospital/h1/task')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('message');
    });

    it('error response follows { statusCode, message, error } shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/hospital/h1/task/non-existent-id')
        .expect(404);

      expect(res.body).toMatchObject({
        statusCode: 404,
        message: expect.any(String),
        error: expect.any(String),
      });
    });
  });
});
