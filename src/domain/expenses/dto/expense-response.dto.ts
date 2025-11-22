import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type, Exclude } from 'class-transformer';
import { ExpenseCategory } from '@app/database';

@Exclude()
class UserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  @Expose()
  email: string;
}

@Expose()
export class ExpenseResponseDto {
  @ApiProperty({ description: 'Expense ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Expense description',
    example: 'Coffee for customers',
  })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Expense amount in INR', example: 500.0 })
  @Expose()
  amount: number;

  @ApiPropertyOptional({
    description: 'Expense category',
    enum: ExpenseCategory,
    example: ExpenseCategory.CUSTOMER_SERVICE,
  })
  @Expose()
  category?: ExpenseCategory;

  @ApiProperty({
    description: 'Date when expense occurred',
    example: '2025-01-15',
  })
  @Expose()
  expenseDate: Date;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Bought coffee for 10 customers',
  })
  @Expose()
  notes?: string;

  @ApiProperty({ description: 'User who recorded the expense', type: UserDto })
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @ApiProperty({ description: 'Created at timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  @Expose()
  updatedAt: Date;
}
