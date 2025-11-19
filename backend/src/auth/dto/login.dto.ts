import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username or email address',
    example: 'admin',
  })
  @IsString()
  @MinLength(1)
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'admin',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}