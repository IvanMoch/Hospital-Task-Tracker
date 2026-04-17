import { Test, TestingModule } from '@nestjs/testing';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

const mockHospitalService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('HospitalController', () => {
  let controller: HospitalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HospitalController],
      providers: [
        { provide: HospitalService, useValue: mockHospitalService },
      ],
    }).compile();

    controller = module.get<HospitalController>(HospitalController);
    jest.clearAllMocks();
  });

  describe('POST /hospitals', () => {
    it('should call service.create with the dto and return the result', async () => {
      const dto: CreateHospitalDto = { name: 'Hospital Central', code: 'HC-01' };
      const created = { id: '1', ...dto };

      mockHospitalService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(mockHospitalService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('GET /hospitals', () => {
    it('should call service.findAll and return the list', async () => {
      const hospitals = [{ id: '1', name: 'Hospital Central', code: 'HC-01' }];
      mockHospitalService.findAll.mockResolvedValue(hospitals);

      const result = await controller.findAll();

      expect(mockHospitalService.findAll).toHaveBeenCalled();
      expect(result).toEqual(hospitals);
    });
  });

  describe('GET /hospitals/:id', () => {
    it('should call service.findOne with the id and return the hospital', async () => {
      const hospital = { id: '1', name: 'Hospital Central', code: 'HC-01' };

      mockHospitalService.findOne.mockResolvedValue(hospital);

      const result = await controller.findOne(hospital.id);

      expect(mockHospitalService.findOne).toHaveBeenCalledWith(hospital.id);
      expect(result).toEqual(hospital);
    });
  });

  describe('PATCH /hospitals/:id', () => {
    it('should call service.update with id and dto and return the result', async () => {
      const dto: UpdateHospitalDto = { name: 'Hospital Actualizado' };
      const updated = { id: '1', name: 'Hospital Actualizado', code: 'HC-01' };

      mockHospitalService.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto);

      expect(mockHospitalService.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('DELETE /hospitals/:id', () => {
    it('should call service.remove with the id', async () => {
      mockHospitalService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockHospitalService.remove).toHaveBeenCalledWith('1');
    });
  });
});
