import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

class UpdatableTaskFieldsDto extends OmitType(CreateTaskDto, ['status'] as const) {}

export class UpdateTaskDto extends PartialType(UpdatableTaskFieldsDto) {}
