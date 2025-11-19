import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle plate number',
    example: 'BK 1234 AB',
  })
  @IsString()
  plateNumber: string;

  @ApiProperty({
    description: 'Vehicle type',
    example: 'Mobil',
    enum: ['Mobil', 'Motor', 'Truk'],
  })
  @IsString()
  vehicleType: string;

  @ApiProperty({
    description: 'Vehicle color',
    example: 'Merah',
  })
  @IsString()
  color: string;

  @ApiProperty({
    description: 'Owner name',
    example: 'Ahmad Wijaya',
  })
  @IsString()
  ownerName: string;

  @ApiProperty({
    description: 'Tax status',
    example: 'Aktif',
    enum: ['Aktif', 'Mati'],
  })
  @IsString()
  taxStatus: string;

  @ApiProperty({
    description: 'Tax expiry date',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  taxExpiryDate?: string;
}