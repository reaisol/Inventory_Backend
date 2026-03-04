import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { CalculateOrderResponseDto } from './dto/calculate-order-response.dto';
import { OrderQueryPaginationDto } from './dto/order-query-pagination.dto';
import {
  JwtAuthGuard,
  PoliciesGuard,
  CurrentUserDecorator,
  CheckPolicies,
} from '@app/authentication';
import { OrderStatus } from '@app/database';
import { plainToClass } from 'class-transformer';
import { CurrentUser } from '@app/authentication';
import {
  CreateOrderPolicyHandler,
  ReadOrderPolicyHandler,
} from './handlers/order-policy.handler';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('calculate')
  @ApiOperation({
    summary: 'Calculate order total without saving (quote/preview)',
  })
  @ApiResponse({
    status: 200,
    description: 'Order calculation completed successfully',
    type: CalculateOrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product or customer not found' })
  @CheckPolicies(new CreateOrderPolicyHandler())
  async calculate(@Body() createOrderDto: CreateOrderDto) {
    const result = await this.ordersService.calculate(createOrderDto);
    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order (billing)' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product or customer not found' })
  @CheckPolicies(new CreateOrderPolicyHandler())
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    const order = await this.ordersService.create(createOrderDto, user.id);
    return plainToClass(OrderResponseDto, order);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'List of orders retrieved successfully',
  })
  @CheckPolicies(new ReadOrderPolicyHandler())
  async findAll(@Query() paginationQuery: OrderQueryPaginationDto) {
    const result = await this.ordersService.findAll(paginationQuery);
    return {
      data: result.data.map((order) => plainToClass(OrderResponseDto, order)),
      meta: result.meta,
    };
  }

  @Get('order-number/:orderNumber')
  @ApiOperation({ summary: 'Get order by order number' })
  @ApiParam({ name: 'orderNumber', type: String })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @CheckPolicies(new ReadOrderPolicyHandler())
  async findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    const order = await this.ordersService.findByOrderNumber(orderNumber);
    return plainToClass(OrderResponseDto, order);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @CheckPolicies(new ReadOrderPolicyHandler())
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.findOne(id);
    return plainToClass(OrderResponseDto, order);
  }
}
