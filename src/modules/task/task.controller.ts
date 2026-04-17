import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@ApiTags('Tasks')
@Controller('hospital/:hospitalId/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task for a hospital' })
  @ApiCreatedResponse({ description: 'Task created successfully.' })
  create(@Param('hospitalId') hospitalId: string, @Body() dto: CreateTaskDto) {
    return this.taskService.create(hospitalId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List active tasks for a hospital', description: 'Supports optional filters: ?status= and ?priority=' })
  @ApiOkResponse({ description: 'List of tasks.' })
  findAll(@Param('hospitalId') hospitalId: string, @Query() filters: FilterTaskDto) {
    return this.taskService.findAll(hospitalId, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task count and percentage per status for a hospital' })
  @ApiOkResponse({
    description: 'Task stats per status.',
    schema: {
      example: {
        data: {
          PENDING:     { count: 3, percentage: 75 },
          IN_PROGRESS: { count: 1, percentage: 25 },
          COMPLETED:   { count: 0, percentage: 0 },
          CANCELLED:   { count: 0, percentage: 0 },
        },
        message: '',
      },
    },
  })
  getStats(@Param('hospitalId') hospitalId: string) {
    return this.taskService.getStats(hospitalId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiOkResponse({ description: 'Task found.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  findOne(@Param('hospitalId') hospitalId: string, @Param('id') id: string) {
    return this.taskService.findOne(hospitalId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiOkResponse({ description: 'Task updated.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  update(@Param('hospitalId') hospitalId: string, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(hospitalId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a task' })
  @ApiOkResponse({ description: 'Task deleted.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  remove(@Param('hospitalId') hospitalId: string, @Param('id') id: string) {
    return this.taskService.remove(hospitalId, id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Transition task status',
    description: 'Valid transitions: PENDING→IN_PROGRESS, PENDING→CANCELLED, IN_PROGRESS→COMPLETED, IN_PROGRESS→CANCELLED',
  })
  @ApiOkResponse({ description: 'Status updated.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  @ApiBadRequestResponse({ description: 'Invalid status transition.' })
  updateStatus(
    @Param('hospitalId') hospitalId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateStatus(hospitalId, id, dto.status);
  }
}
