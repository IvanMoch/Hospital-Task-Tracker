import { IsEnum, IsOptional } from 'class-validator';
import { TaskPriority } from './task-priority.enum';
import { TaskStatus } from './task-status.enum';

export class FilterTaskDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
