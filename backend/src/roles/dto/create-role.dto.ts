import { IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'Operator',
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Can view and edit vehicle data',
  })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({
    description: 'Can view data',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  canView?: boolean = true;

  @ApiProperty({
    description: 'Can edit data',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  canEdit?: boolean = false;

  @ApiProperty({
    description: 'Can export data',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  canExport?: boolean = false;

  @ApiProperty({
    description: 'Can delete data',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  canDelete?: boolean = false;
}