import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScanDto {
  @ApiProperty({
    description: 'Detected plate number from CCTV/image',
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
    description: 'Owner name (if found in database)',
    example: 'Ahmad Wijaya',
    required: false,
  })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiProperty({
    description: 'Tax status (if found in database)',
    example: 'Aktif',
    enum: ['Aktif', 'Mati'],
    required: false,
  })
  @IsOptional()
  @IsString()
  taxStatus?: string;

  @ApiProperty({
    description: 'Scan location',
    example: 'Jl. Gatot Subroto - Medan',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Additional metadata about the scan',
    required: false,
  })
  @IsOptional()
  metadata?: {
    cameraId?: string;
    confidence?: number;
    imageUrl?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}