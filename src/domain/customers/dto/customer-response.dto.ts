import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CustomerResponseDto {
  @ApiProperty({ description: 'Customer ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'john.doe@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Customer phone', example: '+91 9876543210' })
  @Expose()
  phone: string;

  @ApiProperty({
    description: 'Customer address',
    example: '123 Main Street, City, State',
  })
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
