import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '@app/database';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import {
  PaginatedResponse,
  createPaginationMeta,
} from '../../shared/interfaces/pagination-response.interface';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Check email uniqueness if provided
    if (createCustomerDto.email) {
      const existing = await this.customerRepository.findOne({
        where: { email: createCustomerDto.email },
      });
      if (existing) {
        throw new ConflictException(
          `Customer with email ${createCustomerDto.email} already exists`,
        );
      }
    }

    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Customer>> {
    const { page, limit, sortBy, sortOrder, search } = paginationQuery;
    const skip = (page - 1) * limit;

    const query = this.customerRepository.createQueryBuilder('customer');

    if (search) {
      query.where(
        '(customer.name ILIKE :search OR customer.email ILIKE :search OR customer.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      const sortField = `customer.${sortBy}`;
      query.orderBy(sortField, sortOrder);
    } else {
      query.orderBy('customer.createdAt', 'DESC');
    }

    const totalItems = await query.getCount();
    query.skip(skip).take(limit);

    const data = await query.getMany();
    const meta = createPaginationMeta(page, limit, totalItems);

    return { data, meta };
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    // Check email uniqueness if updating
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existing = await this.customerRepository.findOne({
        where: { email: updateCustomerDto.email },
      });
      if (existing) {
        throw new ConflictException(
          `Customer with email ${updateCustomerDto.email} already exists`,
        );
      }
    }

    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }
}
