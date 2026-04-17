import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TaskPriority } from './task-priority.enum';
import { TaskStatus } from './task-status.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsEnum(TaskPriority)
  priority: TaskPriority;
}
