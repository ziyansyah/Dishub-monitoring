import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { CreateVehicleDto } from './create-vehicle.dto';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  taxStatus?: string;

  @IsOptional()
  @IsDateString()
  taxExpiryDate?: string;

  @IsOptional()
  isActive?: boolean;
}