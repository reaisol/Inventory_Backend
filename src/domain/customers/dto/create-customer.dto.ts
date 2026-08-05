import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() ? value.trim() : undefined))
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Customer phone',
    example: '+91 9876543210',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Customer address',
    example: '123 Main Street, City, State',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
