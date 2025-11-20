import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'User password (min 8 characters)',
    example: 'password123',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: 'Array of role IDs',
    example: [1, 2],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds?: number[];
}
