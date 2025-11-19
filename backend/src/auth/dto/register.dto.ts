import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Role ID',
    example: 'role_id_here',
    required: false,
  })
  @IsOptional()
  @IsString()
  roleId?: string;
}