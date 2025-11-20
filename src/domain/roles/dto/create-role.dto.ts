import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'admin' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Array of permission names',
    example: ['create_user', 'read_user'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
