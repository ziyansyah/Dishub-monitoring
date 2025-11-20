import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SearchDto } from '../../common/dto/pagination.dto';

export class QueryScansDto extends SearchDto {
  @ApiPropertyOptional({
    description: 'Filter by time period',
    example: 'today',
    enum: ['today', 'week', 'month'],
  })
  @IsOptional()
  @IsEnum(['today', 'week', 'month'])
  filter?: string;

  @ApiPropertyOptional({
    description: 'Filter by vehicle type',
    example: 'Mobil',
  })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiPropertyOptional({
    description: 'Filter by tax status',
    example: 'Aktif',
  })
  @IsOptional()
  @IsString()
  taxStatus?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID who performed the scan',
    example: 'user_id_here',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by location',
    example: 'Jl. Gatot Subroto',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Start date filter (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'scanTime',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'scanTime';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}