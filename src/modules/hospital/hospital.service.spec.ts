import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

const mockPrismaService = {
  hospital: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('HospitalService', () => {
  let service: HospitalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HospitalService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<HospitalService>(HospitalService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a hospital and return it', async () => {
      const dto: CreateHospitalDto = { name: 'Hospital Central', code: 'HC-01' };
      const created = { id: '1', ...dto, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };

      mockPrismaService.hospital.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockPrismaService.hospital.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return only active hospitals', async () => {
      const hospitals = [
        { id: '1', name: 'Hospital Central', code: 'HC-01', deletedAt: null },
      ];

      mockPrismaService.hospital.findMany.mockResolvedValue(hospitals);

      const result = await service.findAll();

      expect(mockPrismaService.hospital.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(result).toEqual(hospitals);
    });
  });

  describe('findOne', () => {
    it('should return the hospital when it exists and is active', async () => {
      const existing = { id: '1', name: 'Hospital Central', code: 'HC-01', deletedAt: null };

      mockPrismaService.hospital.findUnique.mockResolvedValue(existing);

      const result = await service.findOne('1');

      expect(mockPrismaService.hospital.findUnique).toHaveBeenCalledWith({
        where: { id: '1', deletedAt: null },
      });
      expect(result).toEqual(existing);
    });

    it('should throw NotFoundException when hospital does not exist', async () => {
      mockPrismaService.hospital.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when hospital is soft-deleted', async () => {
      mockPrismaService.hospital.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.hospital.findUnique).toHaveBeenCalledWith({
        where: { id: '1', deletedAt: null },
      });
    });
  });

  describe('update', () => {
    it('should update an active hospital and return it', async () => {
      const dto: UpdateHospitalDto = { name: 'Hospital Actualizado' };
      const existing = { id: '1', name: 'Hospital Central', code: 'HC-01', deletedAt: null };
      const updated = { ...existing, ...dto };

      mockPrismaService.hospital.findUnique.mockResolvedValue(existing);
      mockPrismaService.hospital.update.mockResolvedValue(updated);

      const result = await service.update('1', dto);

      expect(mockPrismaService.hospital.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if hospital does not exist', async () => {
      mockPrismaService.hospital.findUnique.mockResolvedValue(null);

      await expect(service.update('999', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete an active hospital', async () => {
      const existing = { id: '1', name: 'Hospital Central', code: 'HC-01', deletedAt: null };

      mockPrismaService.hospital.findUnique.mockResolvedValue(existing);
      mockPrismaService.hospital.update.mockResolvedValue({ ...existing, deletedAt: new Date() });

      await service.remove('1');

      expect(mockPrismaService.hospital.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if hospital does not exist', async () => {
      mockPrismaService.hospital.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
