import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  itemCount: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  pageCount: number;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage: boolean;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNextPage: boolean;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully',
  })
  message: string;
}
