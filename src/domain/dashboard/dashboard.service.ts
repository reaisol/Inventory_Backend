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

  async getSalesDashboard(
    metalTypeId?: number,
  ): Promise<SalesDashboardResponseDto> {
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

    // Get all metal types dynamically
    const allMetalTypes = await this.metalTypeRepository.find({
      order: { name: 'ASC' },
    });

    // Filter metal types if metalTypeId is provided
    const filteredMetalTypes = metalTypeId
      ? allMetalTypes.filter((mt) => mt.id === metalTypeId)
      : allMetalTypes;

    // Build metal type map for quick lookup
    const metalTypeMap = new Map<number, MetalType>();
    filteredMetalTypes.forEach((mt) => metalTypeMap.set(mt.id, mt));

    // Gold and Silver Sold (for backward compatibility, but now dynamic)
    const todayOrderItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.metalType', 'metalType')
      .where('order.orderDate >= :today', { today })
      .andWhere('order.orderDate < :tomorrow', { tomorrow })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    // Apply metal filter if provided
    const filteredTodayOrderItems = metalTypeId
      ? todayOrderItems.filter(
          (item) =>
            item.product?.metalType?.id === metalTypeId ||
            item.product?.metalTypeId === metalTypeId,
        )
      : todayOrderItems;

    const metalSoldToday = new Map<number, number>();

    for (const item of filteredTodayOrderItems) {
      if (item.product && item.product.metalType) {
        const itemMetalTypeId = item.product.metalType.id;
        const weight = Number(item.product.grossWeightGm || 0);
        metalSoldToday.set(
          itemMetalTypeId,
          (metalSoldToday.get(itemMetalTypeId) || 0) + weight,
        );
      }
    }

    // Get current month and last month metal sold
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

    // Apply metal filter if provided
    const filteredCurrentMonthOrderItems = metalTypeId
      ? currentMonthOrderItems.filter(
          (item) =>
            item.product?.metalType?.id === metalTypeId ||
            item.product?.metalTypeId === metalTypeId,
        )
      : currentMonthOrderItems;

    const filteredLastMonthOrderItems = metalTypeId
      ? lastMonthOrderItems.filter(
          (item) =>
            item.product?.metalType?.id === metalTypeId ||
            item.product?.metalTypeId === metalTypeId,
        )
      : lastMonthOrderItems;

    const currentMonthMetalSold = new Map<number, number>();
    const lastMonthMetalSold = new Map<number, number>();

    for (const item of filteredCurrentMonthOrderItems) {
      if (item.product && item.product.metalType) {
        const itemMetalTypeId = item.product.metalType.id;
        const weight = Number(item.product.grossWeightGm || 0);
        currentMonthMetalSold.set(
          itemMetalTypeId,
          (currentMonthMetalSold.get(itemMetalTypeId) || 0) + weight,
        );
      }
    }

    for (const item of filteredLastMonthOrderItems) {
      if (item.product && item.product.metalType) {
        const itemMetalTypeId = item.product.metalType.id;
        const weight = Number(item.product.grossWeightGm || 0);
        lastMonthMetalSold.set(
          itemMetalTypeId,
          (lastMonthMetalSold.get(itemMetalTypeId) || 0) + weight,
        );
      }
    }

    // Metal Credits - Dynamic for all metal types
    const todayExchanges = await this.exchangeRepository
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.order', 'order')
      .leftJoinAndSelect('exchange.metalPurity', 'metalPurity')
      .leftJoinAndSelect('metalPurity.metalType', 'metalType')
      .where('order.orderDate >= :today', { today })
      .andWhere('order.orderDate < :tomorrow', { tomorrow })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    const currentMonthExchanges = await this.exchangeRepository
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.order', 'order')
      .leftJoinAndSelect('exchange.metalPurity', 'metalPurity')
      .leftJoinAndSelect('metalPurity.metalType', 'metalType')
      .where('order.orderDate >= :start', { start: currentMonthStart })
      .andWhere('order.orderDate <= :end', { end: currentMonthEnd })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    const lastMonthExchanges = await this.exchangeRepository
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.order', 'order')
      .leftJoinAndSelect('exchange.metalPurity', 'metalPurity')
      .leftJoinAndSelect('metalPurity.metalType', 'metalType')
      .where('order.orderDate >= :start', { start: lastMonthStart })
      .andWhere('order.orderDate <= :end', { end: lastMonthEnd })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    // Calculate credits by metal type
    const todayCreditsByMetal = new Map<number, number>();
    const currentMonthCreditsByMetal = new Map<number, number>();
    const lastMonthCreditsByMetal = new Map<number, number>();

    for (const exchange of todayExchanges) {
      if (exchange.metalPurity?.metalType) {
        const exchangeMetalTypeId = exchange.metalPurity.metalType.id;
        // Apply filter if provided
        if (!metalTypeId || exchangeMetalTypeId === metalTypeId) {
          const credit = Number(exchange.totalCredit || 0);
          todayCreditsByMetal.set(
            exchangeMetalTypeId,
            (todayCreditsByMetal.get(exchangeMetalTypeId) || 0) + credit,
          );
        }
      }
    }

    for (const exchange of currentMonthExchanges) {
      if (exchange.metalPurity?.metalType) {
        const exchangeMetalTypeId = exchange.metalPurity.metalType.id;
        // Apply filter if provided
        if (!metalTypeId || exchangeMetalTypeId === metalTypeId) {
          const credit = Number(exchange.totalCredit || 0);
          currentMonthCreditsByMetal.set(
            exchangeMetalTypeId,
            (currentMonthCreditsByMetal.get(exchangeMetalTypeId) || 0) + credit,
          );
        }
      }
    }

    for (const exchange of lastMonthExchanges) {
      if (exchange.metalPurity?.metalType) {
        const exchangeMetalTypeId = exchange.metalPurity.metalType.id;
        // Apply filter if provided
        if (!metalTypeId || exchangeMetalTypeId === metalTypeId) {
          const credit = Number(exchange.totalCredit || 0);
          lastMonthCreditsByMetal.set(
            exchangeMetalTypeId,
            (lastMonthCreditsByMetal.get(exchangeMetalTypeId) || 0) + credit,
          );
        }
      }
    }

    // Build metal sold array
    const metalSold = filteredMetalTypes.map((metalType) => {
      const todaySold = metalSoldToday.get(metalType.id) || 0;
      const currentMonthSold = currentMonthMetalSold.get(metalType.id) || 0;
      const lastMonthSold = lastMonthMetalSold.get(metalType.id) || 0;
      const soldChange =
        lastMonthSold > 0
          ? ((currentMonthSold - lastMonthSold) / lastMonthSold) * 100
          : 0;

      return {
        metalType: metalType.name,
        metalCode: metalType.code,
        sold: {
          value: todaySold,
          change: soldChange,
          isPositive: soldChange >= 0,
        },
      };
    });

    // Build metal credits array
    const metalCredits = filteredMetalTypes.map((metalType) => {
      const todayCredit = todayCreditsByMetal.get(metalType.id) || 0;
      const currentMonthCredit =
        currentMonthCreditsByMetal.get(metalType.id) || 0;
      const lastMonthCredit = lastMonthCreditsByMetal.get(metalType.id) || 0;
      const creditChange =
        lastMonthCredit > 0
          ? ((currentMonthCredit - lastMonthCredit) / lastMonthCredit) * 100
          : 0;

      return {
        metalType: metalType.name,
        metalCode: metalType.code,
        credit: {
          value: todayCredit,
          change: creditChange,
          isPositive: creditChange >= 0,
        },
      };
    });

    // Sales Trend (Last 30 days) - Dynamic for all metals
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

    // Apply metal filter if provided
    const filteredTrendOrders = metalTypeId
      ? trendOrders.map((order) => ({
          ...order,
          orderItems: order.orderItems.filter(
            (item) =>
              item.product?.metalType?.id === metalTypeId ||
              item.product?.metalTypeId === metalTypeId,
          ),
        }))
      : trendOrders;

    // Group by date and metal type
    const salesByDate = new Map<string, Map<number, number>>();

    for (const order of filteredTrendOrders) {
      const orderDate = new Date(order.orderDate);
      orderDate.setHours(0, 0, 0, 0);
      const dateStr = orderDate.toISOString().split('T')[0];

      if (!salesByDate.has(dateStr)) {
        salesByDate.set(dateStr, new Map<number, number>());
      }

      const dateSales = salesByDate.get(dateStr)!;

      for (const item of order.orderItems) {
        if (item.product && item.product.metalType) {
          const itemMetalTypeId = item.product.metalType.id;
          // Only include if metal type is in our filtered list
          if (metalTypeMap.has(itemMetalTypeId)) {
            const sales = Number(item.totalPrice || 0);
            dateSales.set(
              itemMetalTypeId,
              (dateSales.get(itemMetalTypeId) || 0) + sales,
            );
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
      const dateSales = salesByDate.get(dateStr) || new Map<number, number>();

      // Build salesByMetal object with all metal types
      const salesByMetal: Record<string, number> = {};
      filteredMetalTypes.forEach((metalType) => {
        salesByMetal[metalType.code] = dateSales.get(metalType.id) || 0;
      });

      salesTrend.push({
        date: dateStr,
        salesByMetal,
      });
    }

    // Top Categories by Revenue
    let categoryQuery = this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.order', 'order')
      .leftJoin('orderItem.product', 'product')
      .leftJoin('product.category', 'category')
      .select('category.name', 'category')
      .addSelect('SUM(orderItem.totalPrice)', 'revenue')
      .where('order.status = :status', { status: OrderStatus.COMPLETED });

    // Apply metal filter if provided
    if (metalTypeId) {
      categoryQuery = categoryQuery.andWhere(
        'product.metalTypeId = :metalTypeId',
        { metalTypeId },
      );
    }

    const categoryRevenue = await categoryQuery
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
      metalSold,
      metalCredits,
      salesTrend,
      topCategoriesByRevenue: topCategories,
    };
  }

  async getInventoryDashboard(
    metalTypeId?: number,
  ): Promise<InventoryDashboardResponseDto> {
    // Get all metal types dynamically
    const allMetalTypes = await this.metalTypeRepository.find({
      order: { name: 'ASC' },
    });

    // Filter metal types if metalTypeId is provided
    const filteredMetalTypes = metalTypeId
      ? allMetalTypes.filter((mt) => mt.id === metalTypeId)
      : allMetalTypes;

    // Build metal type map for quick lookup
    const metalTypeMap = new Map<number, MetalType>();
    filteredMetalTypes.forEach((mt) => metalTypeMap.set(mt.id, mt));

    // Build where condition for products
    const productWhereCondition: any = { status: ProductStatus.IN_STOCK };
    if (metalTypeId) {
      productWhereCondition.metalTypeId = metalTypeId;
    }

    // Total Inventory Value
    const inStockProducts = await this.productRepository.find({
      where: productWhereCondition,
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

    // Calculate metal-wise inventory
    const metalInventoryMap = new Map<
      number,
      { value: number; stockGm: number; items: number }
    >();

    // Initialize metal inventory map
    filteredMetalTypes.forEach((metalType) => {
      metalInventoryMap.set(metalType.id, {
        value: 0,
        stockGm: 0,
        items: 0,
      });
    });

    for (const product of inStockProducts) {
      const weight = Number(product.grossWeightGm || 0);
      totalMetalStockGm += weight;

      const pricePerGram = purityPriceMap.get(product.metalPurityId) || 0;
      const basePrice = weight * pricePerGram;
      const wastage =
        basePrice * (Number(product.wastagePercentage || 0) / 100);
      const makingCharges = product.makingChargesAmount ? Number(product.makingChargesAmount) : 0;
      const stoneCost = product.stoneCost ? Number(product.stoneCost) : 0;
      const productValue = basePrice + wastage + makingCharges + stoneCost;
      totalInventoryValue += productValue;

      // Add to metal-wise breakdown
      if (product.metalType) {
        const metalData = metalInventoryMap.get(product.metalType.id);
        if (metalData) {
          metalData.value += productValue;
          metalData.stockGm += weight;
          metalData.items += 1;
        }
      }
    }

    // Build metal inventory array
    const metalInventory = filteredMetalTypes.map((metalType) => {
      const data = metalInventoryMap.get(metalType.id) || {
        value: 0,
        stockGm: 0,
        items: 0,
      };
      return {
        metalType: metalType.name,
        metalCode: metalType.code,
        inventoryValue: Math.round(data.value),
        stockGm: Number(data.stockGm.toFixed(3)),
        items: data.items,
      };
    });

    // Total Items
    const totalItems = inStockProducts.length;

    // Most Stocked Category
    let categoryQuery = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select('category.name', 'category')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.status = :status', { status: ProductStatus.IN_STOCK })
      .andWhere('category.id IS NOT NULL'); // Only include products with valid category

    // Apply metal filter if provided
    if (metalTypeId) {
      categoryQuery = categoryQuery.andWhere(
        'product.metalTypeId = :metalTypeId',
        { metalTypeId },
      );
    }

    const categoryCount = await categoryQuery
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
    let productsAddedQuery = this.productRepository
      .createQueryBuilder('product')
      .select("DATE_TRUNC('day', product.createdAt)", 'date')
      .addSelect('COUNT(product.id)', 'count')
      .where('product.createdAt >= :start', { start: flowStartDate })
      .andWhere('product.createdAt <= :end', { end: flowEndDate });

    // Apply metal filter if provided
    if (metalTypeId) {
      productsAddedQuery = productsAddedQuery.andWhere(
        'product.metalTypeId = :metalTypeId',
        { metalTypeId },
      );
    }

    const productsAdded = await productsAddedQuery
      .groupBy("DATE_TRUNC('day', product.createdAt)")
      .getRawMany();

    // Items Sold (orders completed) - PostgreSQL compatible date truncation
    let productsSoldQuery = this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.order', 'order')
      .leftJoin('orderItem.product', 'product')
      .select("DATE_TRUNC('day', order.orderDate)", 'date')
      .addSelect('COUNT(orderItem.id)', 'count')
      .where('order.orderDate >= :start', { start: flowStartDate })
      .andWhere('order.orderDate <= :end', { end: flowEndDate })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED });

    // Apply metal filter if provided
    if (metalTypeId) {
      productsSoldQuery = productsSoldQuery.andWhere(
        'product.metalTypeId = :metalTypeId',
        { metalTypeId },
      );
    }

    const productsSold = await productsSoldQuery
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
    let purityDistributionQuery = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.metalPurity', 'purity')
      .select('purity.name', 'purity')
      .addSelect('COALESCE(SUM(product.grossWeightGm), 0)', 'stockGm')
      .where('product.status = :status', { status: ProductStatus.IN_STOCK })
      .andWhere('purity.id IS NOT NULL'); // Only include products with valid purity

    // Apply metal filter if provided
    if (metalTypeId) {
      purityDistributionQuery = purityDistributionQuery.andWhere(
        'product.metalTypeId = :metalTypeId',
        { metalTypeId },
      );
    }

    const purityDistribution = await purityDistributionQuery
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
      metalInventory,
      mostStockedCategory,
      inventoryFlowTrend,
      stockDistributionByPurity: stockDistribution,
    };
  }
}
