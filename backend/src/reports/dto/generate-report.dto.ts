import { IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiProperty({
    description: 'Report title',
    example: 'Laporan Kendaraan Januari 2025',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Start date for report data (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for report data (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Tax status filter',
    example: 'all',
    enum: ['all', 'lunas', 'belum-lunas'],
  })
  @IsEnum(['all', 'lunas', 'belum-lunas'])
  taxStatus: string;

  @ApiProperty({
    description: 'Report file format',
    example: 'pdf',
    enum: ['pdf', 'excel'],
  })
  @IsEnum(['pdf', 'excel'])
  format: string;

  @ApiProperty({
    description: 'Report type',
    example: 'vehicle-data',
    enum: ['vehicle-data', 'scan-history', 'tax-compliance', 'activity-logs'],
    required: false,
  })
  @IsEnum(['vehicle-data', 'scan-history', 'tax-compliance', 'activity-logs'])
  type?: string = 'vehicle-data';
}