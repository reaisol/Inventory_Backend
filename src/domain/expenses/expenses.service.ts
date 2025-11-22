import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '@app/database';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryPaginationDto } from './dto/expense-query-pagination.dto';
import {
  PaginatedResponse,
  createPaginationMeta,
} from '../../shared/interfaces/pagination-response.interface';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: number,
  ): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      expenseDate: new Date(createExpenseDto.expenseDate),
      userId,
    });
    return this.expenseRepository.save(expense);
  }

  async findAll(
    paginationQuery: ExpenseQueryPaginationDto,
  ): Promise<PaginatedResponse<Expense>> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      category,
      startDate,
      endDate,
    } = paginationQuery;
    const skip = (page - 1) * limit;

    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('expense.user', 'user')
      .addSelect('user.id')
      .addSelect('user.name')
      .addSelect('user.email')
      .addSelect('user.createdAt')
      .addSelect('user.updatedAt'); // Explicitly select only safe user fields, excluding password

    // Apply filters
    if (category) {
      query.andWhere('expense.category = :category', { category });
    }

    if (startDate) {
      query.andWhere('expense.expenseDate >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      query.andWhere('expense.expenseDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    // Apply search
    if (search) {
      query.andWhere(
        '(expense.description ILIKE :search OR expense.notes ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    if (sortBy) {
      const sortField = sortBy.includes('.') ? sortBy : `expense.${sortBy}`;
      query.orderBy(sortField, sortOrder);
    } else {
      query.orderBy('expense.expenseDate', 'DESC');
    }

    // Get total count
    const totalItems = await query.getCount();

    // Apply pagination
    query.skip(skip).take(limit);

    // Get data
    const data = await query.getMany();

    const meta = createPaginationMeta(page, limit, totalItems);

    return { data, meta };
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin('expense.user', 'user')
      .addSelect('user.id')
      .addSelect('user.name')
      .addSelect('user.email')
      .addSelect('user.createdAt')
      .addSelect('user.updatedAt') // Explicitly select only safe user fields, excluding password
      .where('expense.id = :id', { id })
      .getOne();

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async update(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.findOne(id);

    if (updateExpenseDto.description !== undefined) {
      expense.description = updateExpenseDto.description;
    }
    if (updateExpenseDto.amount !== undefined) {
      expense.amount = updateExpenseDto.amount;
    }
    if (updateExpenseDto.category !== undefined) {
      expense.category = updateExpenseDto.category;
    }
    if (updateExpenseDto.expenseDate !== undefined) {
      expense.expenseDate = new Date(updateExpenseDto.expenseDate);
    }
    if (updateExpenseDto.notes !== undefined) {
      expense.notes = updateExpenseDto.notes;
    }

    return this.expenseRepository.save(expense);
  }

  async remove(id: number): Promise<void> {
    const expense = await this.findOne(id);
    await this.expenseRepository.remove(expense);
  }
}
