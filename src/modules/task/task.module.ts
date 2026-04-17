import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { HospitalModule } from '../hospital/hospital.module';

@Module({
  imports: [PrismaModule, HospitalModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
