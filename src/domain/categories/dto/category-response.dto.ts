import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Category name', example: 'Necklace' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Category code', example: 'NECKLACE' })
  @Expose()
  code: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Necklace category',
  })
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
