import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HospitalService } from './hospital.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@ApiTags('Hospital')
@Controller('hospital')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a hospital' })
  @ApiCreatedResponse({ description: 'Hospital created successfully.' })
  create(@Body() dto: CreateHospitalDto) {
    return this.hospitalService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active hospitals' })
  @ApiOkResponse({ description: 'List of hospitals.' })
  findAll() {
    return this.hospitalService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hospital by ID' })
  @ApiOkResponse({ description: 'Hospital found.' })
  @ApiNotFoundResponse({ description: 'Hospital not found.' })
  findOne(@Param('id') id: string) {
    return this.hospitalService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hospital' })
  @ApiOkResponse({ description: 'Hospital updated.' })
  @ApiNotFoundResponse({ description: 'Hospital not found.' })
  update(@Param('id') id: string, @Body() dto: UpdateHospitalDto) {
    return this.hospitalService.update(id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace a hospital' })
  @ApiOkResponse({ description: 'Hospital updated.' })
  @ApiNotFoundResponse({ description: 'Hospital not found.' })
  replace(@Param('id') id: string, @Body() dto: UpdateHospitalDto) {
    return this.hospitalService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a hospital' })
  @ApiOkResponse({ description: 'Hospital deleted.' })
  @ApiNotFoundResponse({ description: 'Hospital not found.' })
  remove(@Param('id') id: string) {
    return this.hospitalService.remove(id);
  }
}
