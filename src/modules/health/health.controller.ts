import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Returns server status and current timestamp.' })
  @ApiOkResponse({ schema: { example: { data: { status: 'ok', timestamp: '2026-01-01T00:00:00.000Z' }, message: '' } } })
  check() {
    return this.healthService.check();
  }
}
