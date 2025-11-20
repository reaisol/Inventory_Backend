import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class RoleResponseDto {
  @ApiProperty({ description: 'Role ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Role name', example: 'admin' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Array of permission names',
    example: ['create_user', 'read_user'],
    type: [String],
  })
  @Expose()
  permissions: string[];
}
