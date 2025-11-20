import { IsNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPermissionsDto {
  @ApiProperty({
    description: 'Array of permission names',
    example: ['create_user', 'read_user'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
