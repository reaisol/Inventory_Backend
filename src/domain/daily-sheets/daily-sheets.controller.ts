import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { DailySheetsService } from './daily-sheets.service';
import { CreateDailySheetDto } from './dto/create-daily-sheet.dto';
import { UpdateDailySheetDto } from './dto/update-daily-sheet.dto';
import { DailySheetResponseDto } from './dto/daily-sheet-response.dto';
import { DailySheetQueryPaginationDto } from './dto/daily-sheet-query-pagination.dto';
import { DailySheetListItemDto } from './dto/daily-sheet-list-item.dto';
import { MonthlyBalanceSheetQueryDto } from './dto/monthly-balance-sheet-query.dto';
import { MonthlyBalanceSheetResponseDto } from './dto/monthly-balance-sheet-response.dto';
import {
  PaginatedResponse,
  PaginationMeta,
} from '../../shared/interfaces/pagination-response.interface';
import {
  JwtAuthGuard,
  CurrentUserDecorator,
  CurrentUser,
} from '@app/authentication';

@ApiTags('daily-sheets')
@ApiBearerAuth('JWT-auth')
@Controller('daily-sheets')
@UseGuards(JwtAuthGuard)
export class DailySheetsController {
  constructor(private readonly dailySheetsService: DailySheetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all daily sheets with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Daily sheets retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/DailySheetListItemDto' },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            itemCount: { type: 'number' },
            pageCount: { type: 'number' },
            hasPreviousPage: { type: 'boolean' },
            hasNextPage: { type: 'boolean' },
          },
        },
      },
    },
  })
  async findAll(
    @Query() query: DailySheetQueryPaginationDto,
  ): Promise<PaginatedResponse<DailySheetListItemDto>> {
    return this.dailySheetsService.findAll(query);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get daily sheet by date' })
  @ApiResponse({
    status: 200,
    description: 'Daily sheet retrieved successfully',
    type: DailySheetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Daily sheet not found for this date' })
  async findByDate(@Param('date') date: string): Promise<DailySheetResponseDto> {
    return this.dailySheetsService.findByDate(new Date(date));
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly balance sheet' })
  @ApiResponse({
    status: 200,
    description: 'Monthly balance sheet retrieved successfully',
    type: MonthlyBalanceSheetResponseDto,
  })
  async getMonthlyBalanceSheet(
    @Query() query: MonthlyBalanceSheetQueryDto,
  ): Promise<MonthlyBalanceSheetResponseDto> {
    return this.dailySheetsService.getMonthlyBalanceSheet(
      query.year,
      query.month,
    );
  }

  @Get('monthly/export')
  @ApiOperation({ summary: 'Export monthly balance sheet to Excel' })
  @ApiResponse({
    status: 200,
    description: 'Excel file generated successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async exportMonthlyBalanceSheetToExcel(
    @Query() query: MonthlyBalanceSheetQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const workbook = await this.dailySheetsService.exportMonthlyBalanceSheetToExcel(
      query.year,
      query.month,
    );

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthName = monthNames[query.month - 1];
    const fileName = `monthly-balance-sheet-${monthName}-${query.year}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new daily sheet' })
  @ApiResponse({
    status: 201,
    description: 'Daily sheet created successfully',
    type: DailySheetResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Daily sheet already exists for this date' })
  async create(
    @Body() createDto: CreateDailySheetDto,
    @CurrentUserDecorator() user: CurrentUser,
  ): Promise<DailySheetResponseDto> {
    return this.dailySheetsService.create(createDto, user.id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export daily sheet to Excel' })
  @ApiResponse({
    status: 200,
    description: 'Excel file generated successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Daily sheet not found' })
  async exportToExcel(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const workbook = await this.dailySheetsService.exportToExcel(id);

    // Get date for filename
    const dailySheet = await this.dailySheetsService.findOne(id);
    const date = new Date(dailySheet.date);
    const dateStr = date.toISOString().split('T')[0];
    const fileName = `daily-sheet-${dateStr}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  @Post(':id/refresh')
  @ApiOperation({ summary: 'Refresh daily sheet - regenerate transactions from orders and recalculate balance' })
  @ApiResponse({
    status: 200,
    description: 'Daily sheet refreshed successfully',
    type: DailySheetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Daily sheet not found' })
  @ApiResponse({ status: 400, description: 'Cannot refresh locked daily sheet' })
  async refresh(@Param('id', ParseIntPipe) id: number): Promise<DailySheetResponseDto> {
    return this.dailySheetsService.refresh(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get daily sheet by ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily sheet retrieved successfully',
    type: DailySheetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Daily sheet not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DailySheetResponseDto> {
    return this.dailySheetsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update daily sheet' })
  @ApiResponse({
    status: 200,
    description: 'Daily sheet updated successfully',
    type: DailySheetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Daily sheet not found' })
  @ApiResponse({ status: 400, description: 'Cannot modify locked daily sheet' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDailySheetDto,
  ): Promise<DailySheetResponseDto> {
    return this.dailySheetsService.update(id, updateDto);
  }

  // Nested delete routes must come BEFORE generic @Delete(':id') route
  @Delete(':id/transactions/:transactionId')
  @ApiOperation({ summary: 'Delete a transaction from daily sheet' })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async deleteTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ): Promise<{ message: string }> {
    await this.dailySheetsService.deleteTransaction(id, transactionId);
    return { message: 'Transaction deleted successfully' };
  }

  @Delete(':id/finance-entries/:entryId')
  @ApiOperation({ summary: 'Delete a finance entry from daily sheet' })
  @ApiResponse({
    status: 200,
    description: 'Finance entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Finance entry not found' })
  async deleteFinanceEntry(
    @Param('id', ParseIntPipe) id: number,
    @Param('entryId', ParseIntPipe) entryId: number,
  ): Promise<{ message: string }> {
    await this.dailySheetsService.deleteFinanceEntry(id, entryId);
    return { message: 'Finance entry deleted successfully' };
  }

  @Delete(':id/expenses/:expenseId')
  @ApiOperation({ summary: 'Delete an expense from daily sheet' })
  @ApiResponse({
    status: 200,
    description: 'Expense deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async deleteExpense(
    @Param('id', ParseIntPipe) id: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
  ): Promise<{ message: string }> {
    await this.dailySheetsService.deleteExpense(id, expenseId);
    return { message: 'Expense deleted successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete daily sheet' })
  @ApiResponse({
    status: 200,
    description: 'Daily sheet deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Daily sheet not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete locked daily sheet' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{
    message: string;
  }> {
    await this.dailySheetsService.remove(id);
    return { message: 'Daily sheet deleted successfully' };
  }
}

