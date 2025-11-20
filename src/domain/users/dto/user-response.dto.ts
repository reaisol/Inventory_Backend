import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from '../../roles/dto/role-response.dto';

@Exclude()
export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'User roles',
    type: [RoleResponseDto],
  })
  @Expose()
  @Type(() => RoleResponseDto)
  roles: RoleResponseDto[];

  @ApiProperty({
    description: 'User creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
