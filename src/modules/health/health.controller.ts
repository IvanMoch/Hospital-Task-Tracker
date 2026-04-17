import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { SkipTransform } from '../../common/decorators/skip-transform.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @SkipTransform()
  @ApiOperation({ summary: 'Health check', description: 'Returns server status and current timestamp.' })
  @ApiOkResponse({ schema: { example: { status: 'ok', timestamp: '2026-01-01T00:00:00.000Z' } } })
  check() {
    return this.healthService.check();
  }
}
