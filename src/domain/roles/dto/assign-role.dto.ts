import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ description: 'Role ID to assign to the user', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  roleId: number;
}
