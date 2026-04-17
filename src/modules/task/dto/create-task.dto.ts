import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from './task-priority.enum';
import { TaskStatus } from './task-status.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'Revisión equipos UCI', minLength: 3, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional({ example: 'Verificar ventiladores y monitores', maxLength: 1000 })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.PENDING })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.HIGH })
  @IsEnum(TaskPriority)
  priority: TaskPriority;
}
