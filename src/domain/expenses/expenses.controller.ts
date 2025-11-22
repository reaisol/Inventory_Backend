import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { ExpenseQueryPaginationDto } from './dto/expense-query-pagination.dto';
import {
  JwtAuthGuard,
  PoliciesGuard,
  CheckPolicies,
  CurrentUserDecorator,
  CurrentUser,
} from '@app/authentication';
import { plainToClass } from 'class-transformer';
import { MessageResponseDto } from '../../shared/dto/pagination-response.dto';
import {
  CreateExpensePolicyHandler,
  ReadExpensePolicyHandler,
  UpdateExpensePolicyHandler,
  DeleteExpensePolicyHandler,
} from './handlers/expense-policy.handler';
import { ExpenseCategory } from '@app/database';

@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @CheckPolicies(new CreateExpensePolicyHandler())
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    const expense = await this.expensesService.create(
      createExpenseDto,
      user.id,
    );
    return plainToClass(ExpenseResponseDto, expense);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, enum: ExpenseCategory })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'List of expenses retrieved successfully',
  })
  @CheckPolicies(new ReadExpensePolicyHandler())
  async findAll(@Query() paginationQuery: ExpenseQueryPaginationDto) {
    const result = await this.expensesService.findAll(paginationQuery);
    return {
      data: result.data.map((expense) =>
        plainToClass(ExpenseResponseDto, expense),
      ),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Expense retrieved successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @CheckPolicies(new ReadExpensePolicyHandler())
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const expense = await this.expensesService.findOne(id);
    return plainToClass(ExpenseResponseDto, expense);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
    type: ExpenseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @CheckPolicies(new UpdateExpensePolicyHandler())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    const expense = await this.expensesService.update(id, updateExpenseDto);
    return plainToClass(ExpenseResponseDto, expense);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Expense deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @CheckPolicies(new DeleteExpensePolicyHandler())
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.expensesService.remove(id);
    return { message: 'Expense deleted successfully' };
  }
}
