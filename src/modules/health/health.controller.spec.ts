import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('GET /health returns status ok and a timestamp', () => {
    const result = controller.check();

    expect(result).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });
});
