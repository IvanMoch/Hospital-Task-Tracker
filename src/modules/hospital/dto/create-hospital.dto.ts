import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHospitalDto {
  @ApiProperty({ example: 'Hospital Central', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ example: 'HC-01', minLength: 2, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  code: string;
}
