import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: 'Role name', example: 'admin' })
  @IsOptional()
  @IsString()
  name?: string;

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
