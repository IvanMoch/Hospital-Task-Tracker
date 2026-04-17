import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@Injectable()
export class HospitalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHospitalDto) {
    return this.prisma.hospital.create({ data: dto });
  }

  async findAll() {
    return this.prisma.hospital.findMany({ where: { deletedAt: null } });
  }

  async findOne(id: string) {
    const hospital = await this.prisma.hospital.findUnique({
      where: { id, deletedAt: null },
    });
    if (!hospital) throw new NotFoundException('Hospital not found');
    return hospital;
  }

  async update(id: string, dto: UpdateHospitalDto) {
    await this.findOne(id);
    return this.prisma.hospital.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hospital.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
