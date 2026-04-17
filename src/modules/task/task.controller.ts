import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@Controller('hospital/:hospitalId/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Param('hospitalId') hospitalId: string, @Body() dto: CreateTaskDto) {
    return this.taskService.create(hospitalId, dto);
  }

  @Get()
  findAll(@Param('hospitalId') hospitalId: string, @Query() filters: FilterTaskDto) {
    return this.taskService.findAll(hospitalId, filters);
  }

  @Get(':id')
  findOne(@Param('hospitalId') hospitalId: string, @Param('id') id: string) {
    return this.taskService.findOne(hospitalId, id);
  }

  @Patch(':id')
  update(@Param('hospitalId') hospitalId: string, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(hospitalId, id, dto);
  }

  @Delete(':id')
  remove(@Param('hospitalId') hospitalId: string, @Param('id') id: string) {
    return this.taskService.remove(hospitalId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('hospitalId') hospitalId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateStatus(hospitalId, id, dto.status);
  }
}
