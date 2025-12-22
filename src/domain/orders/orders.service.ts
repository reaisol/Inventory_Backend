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
import { CalculateOrderResponseDto } from './dto/calculate-order-response.dto';
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
          // Validate that either metalPurityId or custom purity fields are provided
          if (!exchangeDto.metalPurityId && !exchangeDto.customPurityName) {
            throw new BadRequestException(
              'Either metalPurityId (for predefined purity) or customPurityName (for custom purity) must be provided',
            );
          }

          let pricePerGram: number;
          let metalPurityId: number | null = null;

          // Check if using predefined purity or custom purity
          if (exchangeDto.metalPurityId) {
            // Using predefined purity - get price from database
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

            pricePerGram = exchangeDto.pricePerGram || metalPrice.pricePerGram;
            metalPurityId = exchangeDto.metalPurityId;
          } else {
            // Using custom purity - require manual price per gram
            if (!exchangeDto.pricePerGram) {
              throw new BadRequestException(
                'pricePerGram is required when using custom purity (metalPurityId not provided)',
              );
            }

            if (!exchangeDto.customPurityName) {
              throw new BadRequestException(
                'customPurityName is required when using custom purity (metalPurityId not provided)',
              );
            }

            pricePerGram = exchangeDto.pricePerGram;
            metalPurityId = null;
          }

          const totalCredit = exchangeDto.weightGm * pricePerGram;

          const exchange = queryRunner.manager.create(Exchange, {
            exchangeType: exchangeDto.exchangeType,
            metalPurityId: metalPurityId,
            customPurityName: exchangeDto.customPurityName || null,
            customPurityPercentage: exchangeDto.customPurityPercentage || null,
            weightGm: exchangeDto.weightGm,
            pricePerGram: pricePerGram,
            totalCredit,
          });

          exchanges.push(exchange);
          exchangeCredit += totalCredit;
        }
      }

      // Calculate discounts (apply only to making charges and wastage)
      const makingDiscount = createOrderDto.makingDiscount || 0;
      const wastageDiscount = createOrderDto.wastageDiscount || 0;

      // Ensure discounts don't exceed the respective amounts
      const finalMakingDiscount = Math.min(makingDiscount, makingChargesAmount);
      const finalWastageDiscount = Math.min(wastageDiscount, wastageAmount);

      // Calculate discounted amounts
      const discountedMakingChargesAmount =
        makingChargesAmount - finalMakingDiscount;
      const discountedWastageAmount = wastageAmount - finalWastageDiscount;

      // Calculate final total
      // Total = Subtotal + (Wastage - Wastage Discount) + (Making Charges - Making Discount) - Exchange Credit
      const totalAmount =
        subtotal +
        discountedWastageAmount +
        discountedMakingChargesAmount -
        exchangeCredit;

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
        makingDiscount: finalMakingDiscount,
        wastageDiscount: finalWastageDiscount,
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

  /**
   * Calculate order total without saving (for quote/preview)
   */
  async calculate(createOrderDto: CreateOrderDto): Promise<CalculateOrderResponseDto> {
    // Validate customer if provided
    if (createOrderDto.customerId) {
      const customer = await this.customerRepository.findOne({
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
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['metalPurity', 'metalType', 'category'],
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    // Calculate item prices and totals
    const itemCalculations: CalculateOrderResponseDto['items'] = [];
    let subtotal = 0;
    let wastageAmount = 0;
    let makingChargesAmount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const orderItemDto = createOrderDto.items[i];
      const quantity = orderItemDto.quantity || 1;

      let priceCalculation;
      let soldWeight = product.grossWeightGm;

      if (product.isBulkItem) {
        // Calculate sold weight for bulk items
        soldWeight = Number(((product.weightPerItem || 0) * quantity).toFixed(3));

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
        priceCalculation = calculateProductPrice(tempProduct, metalPrice);
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
        priceCalculation = calculateProductPrice(product, metalPrice);
      }

      itemCalculations.push({
        productId: product.id,
        productName: product.name || product.productId,
        quantity: quantity,
        unitPrice: priceCalculation.totalPrice,
        totalPrice: priceCalculation.totalPrice,
        basePrice: priceCalculation.basePrice,
        wastageAmount: priceCalculation.wastageAmount,
        makingChargesAmount: priceCalculation.makingChargesAmount,
        stoneCost: priceCalculation.stoneCost,
      });

      subtotal += priceCalculation.totalPrice;
      wastageAmount += priceCalculation.wastageAmount;
      makingChargesAmount += priceCalculation.makingChargesAmount;
    }

    // Handle exchanges
    let exchangeCredit = 0;
    const exchangeCalculations: CalculateOrderResponseDto['exchanges'] = [];

    if (createOrderDto.exchanges && createOrderDto.exchanges.length > 0) {
      for (const exchangeDto of createOrderDto.exchanges) {
        // Validate that either metalPurityId or custom purity fields are provided
        if (!exchangeDto.metalPurityId && !exchangeDto.customPurityName) {
          throw new BadRequestException(
            'Either metalPurityId (for predefined purity) or customPurityName (for custom purity) must be provided',
          );
        }

        let pricePerGram: number;
        let metalPurityId: number | null = null;

        // Check if using predefined purity or custom purity
        if (exchangeDto.metalPurityId) {
          // Using predefined purity - get price from database
          const metalPurity = await this.metalPurityRepository.findOne({
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

          pricePerGram = exchangeDto.pricePerGram || metalPrice.pricePerGram;
          metalPurityId = exchangeDto.metalPurityId;
        } else {
          // Using custom purity - require manual price per gram
          if (!exchangeDto.pricePerGram) {
            throw new BadRequestException(
              'pricePerGram is required when using custom purity (metalPurityId not provided)',
            );
          }

          if (!exchangeDto.customPurityName) {
            throw new BadRequestException(
              'customPurityName is required when using custom purity (metalPurityId not provided)',
            );
          }

          pricePerGram = exchangeDto.pricePerGram;
          metalPurityId = null;
        }

        const totalCredit = exchangeDto.weightGm * pricePerGram;

        exchangeCalculations.push({
          exchangeType: exchangeDto.exchangeType,
          metalPurityId: metalPurityId,
          customPurityName: exchangeDto.customPurityName || null,
          weightGm: exchangeDto.weightGm,
          pricePerGram: pricePerGram,
          totalCredit: totalCredit,
        });

        exchangeCredit += totalCredit;
      }
    }

    // Calculate discounts (apply only to making charges and wastage)
    const makingDiscount = createOrderDto.makingDiscount || 0;
    const wastageDiscount = createOrderDto.wastageDiscount || 0;

    // Ensure discounts don't exceed the respective amounts
    const finalMakingDiscount = Math.min(makingDiscount, makingChargesAmount);
    const finalWastageDiscount = Math.min(wastageDiscount, wastageAmount);

    // Calculate discounted amounts
    const discountedMakingChargesAmount =
      makingChargesAmount - finalMakingDiscount;
    const discountedWastageAmount = wastageAmount - finalWastageDiscount;

    // Calculate final total
    const totalAmount =
      subtotal +
      discountedWastageAmount +
      discountedMakingChargesAmount -
      exchangeCredit;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      wastageAmount: Number(wastageAmount.toFixed(2)),
      makingChargesAmount: Number(makingChargesAmount.toFixed(2)),
      makingDiscount: finalMakingDiscount,
      discountedMakingChargesAmount: Number(
        discountedMakingChargesAmount.toFixed(2),
      ),
      wastageDiscount: finalWastageDiscount,
      discountedWastageAmount: Number(discountedWastageAmount.toFixed(2)),
      exchangeCredit: Number(exchangeCredit.toFixed(2)),
      totalAmount: Number(Math.max(0, totalAmount).toFixed(2)),
      items: itemCalculations,
      exchanges: exchangeCalculations,
    };
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
