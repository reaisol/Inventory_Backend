import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import {
  Order,
  OrderItem,
  Product,
  Customer,
  Exchange,
  MetalPurity,
  MetalPrice,
  ProductStatus,
  OrderStatus,
  StockType,
} from '@app/database';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryPaginationDto } from './dto/order-query-pagination.dto';
import {
  PaginatedResponse,
  createPaginationMeta,
} from '../../shared/interfaces/pagination-response.interface';
import { generateOrderNumber } from '../../utils/order-number-generator';
import { calculateProductPrice } from '../../utils/price-calculator';
import { ProductStock } from '@app/database';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,
    @InjectRepository(MetalPurity)
    private readonly metalPurityRepository: Repository<MetalPurity>,
    @InjectRepository(MetalPrice)
    private readonly metalPriceRepository: Repository<MetalPrice>,
    @InjectRepository(ProductStock)
    private readonly productStockRepository: Repository<ProductStock>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate customer if provided
      if (createOrderDto.customerId) {
        const customer = await queryRunner.manager.findOne(Customer, {
          where: { id: createOrderDto.customerId },
        });
        if (!customer) {
          throw new NotFoundException(
            `Customer with ID ${createOrderDto.customerId} not found`,
          );
        }
      }

      // Validate and get products
      const productIds = createOrderDto.items.map((item) => item.productId);
      const products = await queryRunner.manager.find(Product, {
        where: { id: In(productIds) },
        relations: ['metalPurity', 'metalType', 'category'],
      });

      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products not found');
      }

      // Check if products are in stock
      const outOfStockProducts = products.filter(
        (p) => p.status !== ProductStatus.IN_STOCK,
      );
      if (outOfStockProducts.length > 0) {
        throw new BadRequestException(
          `Products not in stock: ${outOfStockProducts
            .map((p) => p.productId)
            .join(', ')}`,
        );
      }

      // Calculate item prices and totals
      const orderItems: OrderItem[] = [];
      let subtotal = 0;
      let wastageAmount = 0;
      let makingChargesAmount = 0;

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const orderItemDto = createOrderDto.items[i];
        const quantity = orderItemDto.quantity || 1;

        // Handle bulk items
        if (product.isBulkItem) {
          // Validate quantity for bulk items
          if (
            !product.remainingQuantity ||
            product.remainingQuantity < quantity
          ) {
            throw new BadRequestException(
              `Only ${product.remainingQuantity || 0} items available for product ${product.productId}. Requested: ${quantity}`,
            );
          }

          // Calculate sold weight for bulk items
          const soldWeight = Number(
            ((product.weightPerItem || 0) * quantity).toFixed(3),
          );

          // Get current metal price
          const metalPrice = await this.getCurrentMetalPrice(
            product.metalPurityId,
          );

          // Create a temporary product object with sold weight for price calculation
          const tempProduct = {
            ...product,
            grossWeightGm: soldWeight,
          };

          // Calculate price for sold quantity
          const priceCalculation = calculateProductPrice(
            tempProduct,
            metalPrice,
          );

          // Update product: reduce remaining quantity and weight
          product.remainingQuantity -= quantity;
          product.grossWeightGm = Number(
            (product.grossWeightGm - soldWeight).toFixed(3),
          );

          // Mark as SOLD if all items are sold
          if (product.remainingQuantity === 0) {
            product.status = ProductStatus.SOLD;
          }

          const orderItem = queryRunner.manager.create(OrderItem, {
            productId: product.id,
            unitPrice: priceCalculation.totalPrice,
            totalPrice: priceCalculation.totalPrice,
            quantity: quantity,
          });

          orderItems.push(orderItem);
          subtotal += priceCalculation.totalPrice;
          wastageAmount += priceCalculation.wastageAmount;
          makingChargesAmount += priceCalculation.makingChargesAmount;
        } else {
          // Regular item - sell entire product
          if (quantity !== 1) {
            throw new BadRequestException(
              `Quantity must be 1 for non-bulk items. Product ${product.productId} is not a bulk item.`,
            );
          }

          // Get current metal price
          const metalPrice = await this.getCurrentMetalPrice(
            product.metalPurityId,
          );

          // Calculate product price
          const priceCalculation = calculateProductPrice(product, metalPrice);

          const orderItem = queryRunner.manager.create(OrderItem, {
            productId: product.id,
            unitPrice: priceCalculation.totalPrice,
            totalPrice: priceCalculation.totalPrice,
            quantity: 1,
          });

          orderItems.push(orderItem);
          subtotal += priceCalculation.totalPrice;
          wastageAmount += priceCalculation.wastageAmount;
          makingChargesAmount += priceCalculation.makingChargesAmount;

          // Mark regular product as SOLD
          product.status = ProductStatus.SOLD;
        }
      }

      // Handle exchanges
      let exchangeCredit = 0;
      const exchanges: Exchange[] = [];

      if (createOrderDto.exchanges && createOrderDto.exchanges.length > 0) {
        for (const exchangeDto of createOrderDto.exchanges) {
          const metalPurity = await queryRunner.manager.findOne(MetalPurity, {
            where: { id: exchangeDto.metalPurityId },
          });

          if (!metalPurity) {
            throw new NotFoundException(
              `Metal purity with ID ${exchangeDto.metalPurityId} not found`,
            );
          }

          const metalPrice = await this.getCurrentMetalPrice(
            exchangeDto.metalPurityId,
          );

          const totalCredit = exchangeDto.weightGm * metalPrice.pricePerGram;

          const exchange = queryRunner.manager.create(Exchange, {
            exchangeType: exchangeDto.exchangeType,
            metalPurityId: exchangeDto.metalPurityId,
            weightGm: exchangeDto.weightGm,
            pricePerGram: metalPrice.pricePerGram,
            totalCredit,
          });

          exchanges.push(exchange);
          exchangeCredit += totalCredit;
        }
      }

      // Calculate final totals
      const discountAmount = createOrderDto.discountAmount || 0;
      const totalAmount =
        subtotal +
        wastageAmount +
        makingChargesAmount -
        exchangeCredit -
        discountAmount;

      // Generate order number
      const orderNumber = await generateOrderNumber(
        queryRunner.manager.getRepository(Order),
      );

      // Create order
      const order = queryRunner.manager.create(Order, {
        orderNumber,
        customerId: createOrderDto.customerId || null,
        userId,
        orderDate: new Date(),
        subtotal,
        exchangeCredit,
        wastageAmount,
        makingChargesAmount,
        discountAmount,
        totalAmount: Math.max(0, totalAmount), // Ensure non-negative
        paymentMethod: createOrderDto.paymentMethod,
        status: OrderStatus.COMPLETED,
        notes: createOrderDto.notes,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Save order items
      for (const item of orderItems) {
        item.orderId = savedOrder.id;
        await queryRunner.manager.save(OrderItem, item);
      }

      // Save exchanges
      for (const exchange of exchanges) {
        exchange.orderId = savedOrder.id;
        await queryRunner.manager.save(Exchange, exchange);
      }

      // Update products and create stock records
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const orderItem = orderItems[i];
        const quantity = orderItem.quantity || 1;

        // Save product (already updated for bulk items above)
        await queryRunner.manager.save(Product, product);

        // Create stock record
        const stockNotes = product.isBulkItem
          ? `Sold ${quantity} items in order ${orderNumber} (${product.remainingQuantity || 0} remaining)`
          : `Sold in order ${orderNumber}`;

        const stockRecord = queryRunner.manager.create(ProductStock, {
          productId: product.id,
          stockType: StockType.OUT,
          referenceType: 'SALE',
          referenceId: savedOrder.id,
          notes: stockNotes,
        });
        await queryRunner.manager.save(ProductStock, stockRecord);
      }

      await queryRunner.commitTransaction();

      // Return order with relations
      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    paginationQuery: OrderQueryPaginationDto,
  ): Promise<PaginatedResponse<Order>> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      customerId,
      status,
      startDate,
      endDate,
    } = paginationQuery;
    const skip = (page - 1) * limit;

    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoin('order.user', 'user')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('order.exchanges', 'exchanges')
      .leftJoinAndSelect('exchanges.metalPurity', 'metalPurity')
      .addSelect('user.id')
      .addSelect('user.name')
      .addSelect('user.email')
      .addSelect('user.createdAt')
      .addSelect('user.updatedAt'); // Explicitly select only safe user fields, excluding password

    if (customerId) {
      query.andWhere('order.customerId = :customerId', {
        customerId: customerId,
      });
    }

    if (status) {
      query.andWhere('order.status = :status', { status: status });
    }

    if (startDate) {
      query.andWhere('order.orderDate >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      query.andWhere('order.orderDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (search) {
      query.andWhere(
        '(order.orderNumber ILIKE :search OR customer.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      const sortField = sortBy.includes('.') ? sortBy : `order.${sortBy}`;
      query.orderBy(sortField, sortOrder);
    } else {
      query.orderBy('order.orderDate', 'DESC');
    }

    const totalItems = await query.getCount();
    query.skip(skip).take(limit);

    const data = await query.getMany();
    const meta = createPaginationMeta(page, limit, totalItems);

    return { data, meta };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoin('order.user', 'user')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('order.exchanges', 'exchanges')
      .leftJoinAndSelect('exchanges.metalPurity', 'metalPurity')
      .addSelect('user.id')
      .addSelect('user.name')
      .addSelect('user.email')
      .addSelect('user.createdAt')
      .addSelect('user.updatedAt')
      .where('order.id = :id', { id })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoin('order.user', 'user')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('order.exchanges', 'exchanges')
      .leftJoinAndSelect('exchanges.metalPurity', 'metalPurity')
      .addSelect('user.id')
      .addSelect('user.name')
      .addSelect('user.email')
      .addSelect('user.createdAt')
      .addSelect('user.updatedAt')
      .where('order.orderNumber = :orderNumber', { orderNumber })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    }

    return order;
  }

  private async getCurrentMetalPrice(
    metalPurityId: number,
  ): Promise<MetalPrice> {
    const price = await this.metalPriceRepository.findOne({
      where: {
        metalPurityId,
        isActive: true,
      },
      order: { effectiveDate: 'DESC' },
    });

    if (!price) {
      throw new NotFoundException(
        `No active price found for metal purity ID ${metalPurityId}`,
      );
    }

    return price;
  }
}
