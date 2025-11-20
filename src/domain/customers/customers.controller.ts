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
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import {
  JwtAuthGuard,
  PoliciesGuard,
  CheckPolicies,
} from '@app/authentication';
import { plainToClass } from 'class-transformer';
import {
  CreateCustomerPolicyHandler,
  ReadCustomerPolicyHandler,
  UpdateCustomerPolicyHandler,
  DeleteCustomerPolicyHandler,
} from './handlers/customer-policy.handler';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @CheckPolicies(new CreateCustomerPolicyHandler())
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customersService.create(createCustomerDto);
    return plainToClass(CustomerResponseDto, customer);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of customers retrieved successfully',
  })
  @CheckPolicies(new ReadCustomerPolicyHandler())
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    const result = await this.customersService.findAll(paginationQuery);
    return {
      data: result.data.map((customer) =>
        plainToClass(CustomerResponseDto, customer),
      ),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @CheckPolicies(new ReadCustomerPolicyHandler())
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const customer = await this.customersService.findOne(id);
    return plainToClass(CustomerResponseDto, customer);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @CheckPolicies(new UpdateCustomerPolicyHandler())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customersService.update(id, updateCustomerDto);
    return plainToClass(CustomerResponseDto, customer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Customer deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @CheckPolicies(new DeleteCustomerPolicyHandler())
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.customersService.remove(id);
    return { message: 'Customer deleted successfully' };
  }
}
