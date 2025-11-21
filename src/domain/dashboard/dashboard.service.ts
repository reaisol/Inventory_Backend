import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Order,
  OrderItem,
  Product,
  Exchange,
  MetalType,
  MetalPurity,
  MetalPrice,
  ProductStatus,
  OrderStatus,
  ExchangeType,
} from '@app/database';
import { SalesDashboardResponseDto } from './dto/sales-dashboard-response.dto';
import { InventoryDashboardResponseDto } from './dto/inventory-dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,
    @InjectRepository(MetalType)
    private readonly metalTypeRepository: Repository<MetalType>,
    @InjectRepository(MetalPurity)
    private readonly metalPurityRepository: Repository<MetalPurity>,
    @InjectRepository(MetalPrice)
    private readonly metalPriceRepository: Repository<MetalPrice>,
  ) {}

  async getSalesDashboard(): Promise<SalesDashboardResponseDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get current month start and end
    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );
    const currentMonthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    // Get last month start and end
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const lastMonthEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
      23,
      59,
      59,
    );

    // Total Sales Today
    const todayOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.orderDate >= :today', { today })
      .andWhere('order.orderDate < :tomorrow', { tomorrow })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    const totalSalesToday = todayOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );

    const currentMonthOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.orderDate >= :start', { start: currentMonthStart })
      .andWhere('order.orderDate <= :end', { end: currentMonthEnd })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    const lastMonthOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.orderDate >= :start', { start: lastMonthStart })
      .andWhere('order.orderDate <= :end', { end: lastMonthEnd })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    const currentMonthSales = currentMonthOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );
    const lastMonthSales = lastMonthOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );
    const salesChange =
      lastMonthSales > 0
        ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100
        : 0;

    // Gold and Silver Sold
    const todayOrderItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.metalType', 'metalType')
      .where('order.orderDate >= :today', { today })
      .andWhere('order.orderDate < :tomorrow', { tomorrow })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    let goldSoldToday = 0;
    let silverSoldToday = 0;

    for (const item of todayOrderItems) {
      if (item.product && item.product.metalType) {
        const metalCode = item.product.metalType.code.toUpperCase();
        if (metalCode === 'GOLD' || metalCode === 'GLD') {
          goldSoldToday += Number(item.product.grossWeightGm || 0);
        } else if (metalCode === 'SILVER' || metalCode === 'SLV') {
          silverSoldToday += Number(item.product.grossWeightGm || 0);
        }
      }
    }

    // Get current month and last month gold/silver sold
    const currentMonthOrderItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.metalType', 'metalType')
      .where('order.orderDate >= :start', { start: currentMonthStart })
      .andWhere('order.orderDate <= :end', { end: currentMonthEnd })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    const lastMonthOrderItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.metalType', 'metalType')
      .where('order.orderDate >= :start', { start: lastMonthStart })
      .andWhere('order.orderDate <= :end', { end: lastMonthEnd })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    let currentMonthGold = 0;
    let currentMonthSilver = 0;
    let lastMonthGold = 0;
    let lastMonthSilver = 0;

    for (const item of currentMonthOrderItems) {
      if (item.product && item.product.metalType) {
        const metalCode = item.product.metalType.code.toUpperCase();
        if (metalCode === 'GOLD' || metalCode === 'GLD') {
          currentMonthGold += Number(item.product.grossWeightGm || 0);
        } else if (metalCode === 'SILVER' || metalCode === 'SLV') {
          currentMonthSilver += Number(item.product.grossWeightGm || 0);
        }
      }
    }

    for (const item of lastMonthOrderItems) {
      if (item.product && item.product.metalType) {
        const metalCode = item.product.metalType.code.toUpperCase();
        if (metalCode === 'GOLD' || metalCode === 'GLD') {
          lastMonthGold += Number(item.product.grossWeightGm || 0);
        } else if (metalCode === 'SILVER' || metalCode === 'SLV') {
          lastMonthSilver += Number(item.product.grossWeightGm || 0);
        }
      }
    }

    const goldChange =
      lastMonthGold > 0
        ? ((currentMonthGold - lastMonthGold) / lastMonthGold) * 100
        : 0;
    const silverChange =
      lastMonthSilver > 0
        ? ((currentMonthSilver - lastMonthSilver) / lastMonthSilver) * 100
        : 0;

    // Old Gold Credit
    const todayExchanges = await this.exchangeRepository
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.order', 'order')
      .where('order.orderDate >= :today', { today })
      .andWhere('order.orderDate < :tomorrow', { tomorrow })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('exchange.exchangeType = :type', { type: ExchangeType.GOLD })
      .getMany();

    const oldGoldCreditToday = todayExchanges.reduce(
      (sum, exchange) => sum + Number(exchange.totalCredit || 0),
      0,
    );

    const currentMonthExchanges = await this.exchangeRepository
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.order', 'order')
      .where('order.orderDate >= :start', { start: currentMonthStart })
      .andWhere('order.orderDate <= :end', { end: currentMonthEnd })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('exchange.exchangeType = :type', { type: ExchangeType.GOLD })
      .getMany();

    const lastMonthExchanges = await this.exchangeRepository
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.order', 'order')
      .where('order.orderDate >= :start', { start: lastMonthStart })
      .andWhere('order.orderDate <= :end', { end: lastMonthEnd })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('exchange.exchangeType = :type', { type: ExchangeType.GOLD })
      .getMany();

    const currentMonthCredit = currentMonthExchanges.reduce(
      (sum, exchange) => sum + Number(exchange.totalCredit),
      0,
    );
    const lastMonthCredit = lastMonthExchanges.reduce(
      (sum, exchange) => sum + Number(exchange.totalCredit),
      0,
    );
    const creditChange =
      lastMonthCredit > 0
        ? ((currentMonthCredit - lastMonthCredit) / lastMonthCredit) * 100
        : 0;

    // Sales Trend (Last 30 days)
    const trendStartDate = new Date(today);
    trendStartDate.setDate(trendStartDate.getDate() - 30);
    trendStartDate.setHours(0, 0, 0, 0);

    const trendEndDate = new Date(today);
    trendEndDate.setHours(23, 59, 59, 999);

    const trendOrders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('product.metalType', 'metalType')
      .where('order.orderDate >= :start', { start: trendStartDate })
      .andWhere('order.orderDate <= :end', { end: trendEndDate })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .orderBy('order.orderDate', 'ASC')
      .getMany();

    // Group by date
    const salesByDate = new Map<string, { gold: number; silver: number }>();

    for (const order of trendOrders) {
      const orderDate = new Date(order.orderDate);
      orderDate.setHours(0, 0, 0, 0);
      const dateStr = orderDate.toISOString().split('T')[0];

      if (!salesByDate.has(dateStr)) {
        salesByDate.set(dateStr, { gold: 0, silver: 0 });
      }

      for (const item of order.orderItems) {
        if (item.product && item.product.metalType) {
          const metalCode = item.product.metalType.code.toUpperCase();
          if (metalCode === 'GOLD' || metalCode === 'GLD') {
            salesByDate.get(dateStr)!.gold += Number(item.totalPrice || 0);
          } else if (metalCode === 'SILVER' || metalCode === 'SLV') {
            salesByDate.get(dateStr)!.silver += Number(item.totalPrice || 0);
          }
        }
      }
    }

    // Fill in missing dates with 0
    const salesTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const sales = salesByDate.get(dateStr) || { gold: 0, silver: 0 };
      salesTrend.push({
        date: dateStr,
        goldSales: sales.gold,
        silverSales: sales.silver,
      });
    }

    // Top Categories by Revenue
    const categoryRevenue = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.order', 'order')
      .leftJoin('orderItem.product', 'product')
      .leftJoin('product.category', 'category')
      .select('category.name', 'category')
      .addSelect('SUM(orderItem.totalPrice)', 'revenue')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .groupBy('category.name')
      .orderBy('revenue', 'DESC')
      .limit(5)
      .getRawMany();

    const topCategories = categoryRevenue.map((item) => ({
      category: item.category,
      revenue: Number(item.revenue),
    }));

    return {
      totalSalesToday: {
        value: totalSalesToday,
        change: salesChange,
        isPositive: salesChange >= 0,
      },
      goldSold: {
        value: goldSoldToday,
        change: goldChange,
        isPositive: goldChange >= 0,
      },
      silverSold: {
        value: silverSoldToday,
        change: silverChange,
        isPositive: silverChange >= 0,
      },
      oldGoldCredit: {
        value: oldGoldCreditToday,
        change: creditChange,
        isPositive: creditChange >= 0,
      },
      salesTrend,
      topCategoriesByRevenue: topCategories,
    };
  }

  async getInventoryDashboard(): Promise<InventoryDashboardResponseDto> {
    // Total Inventory Value
    const inStockProducts = await this.productRepository.find({
      where: { status: ProductStatus.IN_STOCK },
      relations: ['metalPurity', 'metalType'],
    });

    // Get active metal prices
    const purities = await this.metalPurityRepository.find({
      relations: ['metalType'],
    });

    const purityPriceMap = new Map<number, number>();
    for (const purity of purities) {
      const activePrice = await this.metalPriceRepository.findOne({
        where: {
          metalPurityId: purity.id,
          isActive: true,
        },
        order: { effectiveDate: 'DESC' },
      });

      if (activePrice) {
        purityPriceMap.set(purity.id, Number(activePrice.pricePerGram));
      }
    }

    let totalInventoryValue = 0;
    let totalMetalStockGm = 0;

    for (const product of inStockProducts) {
      const weight = Number(product.grossWeightGm || 0);
      totalMetalStockGm += weight;

      const pricePerGram = purityPriceMap.get(product.metalPurityId) || 0;
      const basePrice = weight * pricePerGram;
      const wastage =
        basePrice * (Number(product.wastagePercentage || 0) / 100);
      const makingCharges =
        basePrice * (Number(product.makingChargesPercentage || 0) / 100);
      const stoneCost = product.stoneCost ? Number(product.stoneCost) : 0;
      totalInventoryValue += basePrice + wastage + makingCharges + stoneCost;
    }

    // Total Items
    const totalItems = inStockProducts.length;

    // Most Stocked Category
    const categoryCount = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select('category.name', 'category')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.status = :status', { status: ProductStatus.IN_STOCK })
      .andWhere('category.id IS NOT NULL') // Only include products with valid category
      .groupBy('category.name')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    const mostStockedCategory = categoryCount?.category || 'N/A';

    // Inventory Flow Trend (Last 60 days)
    const flowStartDate = new Date();
    flowStartDate.setDate(flowStartDate.getDate() - 60);
    flowStartDate.setHours(0, 0, 0, 0);

    const flowEndDate = new Date();
    flowEndDate.setHours(23, 59, 59, 999);

    // Items Added (products created) - PostgreSQL compatible date truncation
    const productsAdded = await this.productRepository
      .createQueryBuilder('product')
      .select("DATE_TRUNC('day', product.createdAt)", 'date')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.createdAt >= :start', { start: flowStartDate })
      .andWhere('product.createdAt <= :end', { end: flowEndDate })
      .groupBy("DATE_TRUNC('day', product.createdAt)")
      .getRawMany();

    // Items Sold (orders completed) - PostgreSQL compatible date truncation
    const productsSold = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.order', 'order')
      .select("DATE_TRUNC('day', order.orderDate)", 'date')
      .addSelect('COUNT(orderItem.id)', 'count')
      .where('order.orderDate >= :start', { start: flowStartDate })
      .andWhere('order.orderDate <= :end', { end: flowEndDate })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .groupBy("DATE_TRUNC('day', order.orderDate)")
      .getRawMany();

    const addedMap = new Map<string, number>();
    productsAdded.forEach((item) => {
      // Normalize date string format
      const dateStr =
        item.date instanceof Date
          ? item.date.toISOString().split('T')[0]
          : String(item.date).split('T')[0];
      addedMap.set(dateStr, Number(item.count || 0));
    });

    const soldMap = new Map<string, number>();
    productsSold.forEach((item) => {
      // Normalize date string format
      const dateStr =
        item.date instanceof Date
          ? item.date.toISOString().split('T')[0]
          : String(item.date).split('T')[0];
      soldMap.set(dateStr, Number(item.count || 0));
    });

    const inventoryFlowTrend = [];
    for (let i = 59; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      inventoryFlowTrend.push({
        date: dateStr,
        itemsAdded: addedMap.get(dateStr) || 0,
        itemsSold: soldMap.get(dateStr) || 0,
      });
    }

    // Stock Distribution by Purity
    const purityDistribution = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.metalPurity', 'purity')
      .select('purity.name', 'purity')
      .addSelect('COALESCE(SUM(product.grossWeightGm), 0)', 'stockGm')
      .where('product.status = :status', { status: ProductStatus.IN_STOCK })
      .andWhere('purity.id IS NOT NULL') // Only include products with valid purity
      .groupBy('purity.name')
      .getRawMany();

    const totalStock = purityDistribution.reduce(
      (sum, item) => sum + Number(item.stockGm || 0),
      0,
    );

    const stockDistribution = purityDistribution
      .filter((item) => item.purity) // Filter out null purities
      .map((item) => ({
        purity: item.purity || 'Unknown',
        stockGm: Number(item.stockGm || 0),
        percentage:
          totalStock > 0 ? (Number(item.stockGm || 0) / totalStock) * 100 : 0,
      }));

    return {
      totalInventoryValue: Math.round(totalInventoryValue),
      totalMetalStockGm: Number(totalMetalStockGm.toFixed(3)),
      totalItems,
      mostStockedCategory,
      inventoryFlowTrend,
      stockDistributionByPurity: stockDistribution,
    };
  }
}
