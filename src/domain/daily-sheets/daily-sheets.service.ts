import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, LessThanOrEqual } from 'typeorm';
import {
  DailySheet,
  DailySheetTransaction,
  FinanceEntry,
  DailySheetExpense,
  Order,
  OrderItem,
  Exchange,
  OrderStatus,
  MetalType,
  MetalPrice,
} from '@app/database';
import { CreateDailySheetDto } from './dto/create-daily-sheet.dto';
import { UpdateDailySheetDto } from './dto/update-daily-sheet.dto';
import { DailySheetResponseDto } from './dto/daily-sheet-response.dto';
import { DailySheetQueryPaginationDto } from './dto/daily-sheet-query-pagination.dto';
import { DailySheetListItemDto } from './dto/daily-sheet-list-item.dto';
import { DailySheetByDateResponseDto } from './dto/daily-sheet-by-date-response.dto';
import { MonthlyBalanceSheetResponseDto } from './dto/monthly-balance-sheet-response.dto';
import { plainToInstance } from 'class-transformer';
import {
  PaginatedResponse,
  createPaginationMeta,
} from '../../shared/interfaces/pagination-response.interface';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DailySheetsService {
  constructor(
    @InjectRepository(DailySheet)
    private readonly dailySheetRepository: Repository<DailySheet>,
    @InjectRepository(DailySheetTransaction)
    private readonly transactionRepository: Repository<DailySheetTransaction>,
    @InjectRepository(FinanceEntry)
    private readonly financeEntryRepository: Repository<FinanceEntry>,
    @InjectRepository(DailySheetExpense)
    private readonly dailySheetExpenseRepository: Repository<DailySheetExpense>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,
    @InjectRepository(MetalType)
    private readonly metalTypeRepository: Repository<MetalType>,
    @InjectRepository(MetalPrice)
    private readonly metalPriceRepository: Repository<MetalPrice>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Auto-generate transactions from orders for a given date
   */
  async generateTransactionsFromOrders(
    dailySheetId: number,
    date: Date,
  ): Promise<DailySheetTransaction[]> {
    // Get the daily sheet
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { id: dailySheetId },
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found');
    }

    if (dailySheet.isLocked) {
      throw new BadRequestException('Cannot modify locked daily sheet');
    }

    // Get all completed orders for the date - use date range to compare properly
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('product.metalType', 'metalType')
      .leftJoinAndSelect('product.metalPurity', 'metalPurity')
      .leftJoinAndSelect('order.exchanges', 'exchanges')
      .leftJoinAndSelect('exchanges.metalPurity', 'exchangeMetalPurity')
      .where('order.orderDate >= :startOfDay', { startOfDay })
      .andWhere('order.orderDate <= :endOfDay', { endOfDay })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getMany();

    // Get metal types for categorization (GOLD and SILVER)
    const goldType = await this.metalTypeRepository.findOne({
      where: { code: 'GOLD' },
    });
    const silverType = await this.metalTypeRepository.findOne({
      where: { code: 'SILVER' },
    });

    const goldTypeId = goldType?.id;
    const silverTypeId = silverType?.id;

    const transactions: DailySheetTransaction[] = [];

    // Process each order and create a transaction
    for (const order of orders) {
      // Check if transaction already exists for this order
      const existingTransaction = await this.transactionRepository.findOne({
        where: { orderId: order.id, dailySheetId },
      });

      if (existingTransaction) {
        continue; // Skip if already exists
      }

      // Aggregate gold and silver from order items
      let goldWeight = 0;
      let goldValue = 0;
      let silverWeight = 0;
      let silverValue = 0;
      const productNames: string[] = [];

      // Aggregate old gold and silver from exchanges
      let oldGoldWeight = 0;
      let oldGoldValue = 0;
      let oldSilverWeight = 0;
      let oldSilverValue = 0;

      // Process order items
      for (const orderItem of order.orderItems) {
        const product = orderItem.product;
        if (!product || !product.metalType) continue;

        const quantity = orderItem.quantity || 1;
        const productWeight =
          product.isBulkItem && product.weightPerItem
            ? product.weightPerItem * quantity
            : product.grossWeightGm * quantity;

        productNames.push(product.name);

        // Categorize by metal type
        if (product.metalType.id === goldTypeId) {
          goldWeight += Number(productWeight);
          goldValue += Number(orderItem.totalPrice);
        } else if (product.metalType.id === silverTypeId) {
          silverWeight += Number(productWeight);
          silverValue += Number(orderItem.totalPrice);
        }
      }

      // Process exchanges (old gold/silver)
      for (const exchange of order.exchanges) {
        if (exchange.exchangeType === 'GOLD') {
          oldGoldWeight += Number(exchange.weightGm);
          oldGoldValue += Number(exchange.totalCredit);
        } else if (exchange.exchangeType === 'SILVER') {
          oldSilverWeight += Number(exchange.weightGm);
          oldSilverValue += Number(exchange.totalCredit);
        }
      }

      // Calculate rates (if weights > 0)
      const goldRate = goldWeight > 0 ? goldValue / goldWeight : null;
      const silverRate = silverWeight > 0 ? silverValue / silverWeight : null;

      // Calculate payment split (assuming payment method determines split)
      // You may need to adjust this based on your business logic
      let cashAmount = 0;
      let onlineAmount = 0;

      if (order.paymentMethod === 'CASH') {
        cashAmount = Number(order.totalAmount);
      } else if (
        order.paymentMethod === 'CARD' ||
        order.paymentMethod === 'UPI'
      ) {
        onlineAmount = Number(order.totalAmount);
      } else if (order.paymentMethod === 'MIXED') {
        // For MIXED, split equally or based on your logic
        cashAmount = Number(order.totalAmount) / 2;
        onlineAmount = Number(order.totalAmount) / 2;
      }

      // Create transaction
      const transaction = this.transactionRepository.create({
        dailySheetId,
        transactionDate: order.orderDate,
        description: productNames.join(', ') || order.orderNumber,
        goldWeight,
        goldRate: goldRate || undefined,
        goldValue,
        silverWeight,
        silverRate: silverRate || undefined,
        silverValue,
        makingCharges: Number(order.makingChargesAmount),
        oldGoldWeight,
        oldGoldValue,
        oldSilverWeight,
        oldSilverValue,
        grandTotal: Number(order.totalAmount),
        discount:
          Number(order.makingDiscount || 0) +
          Number(order.wastageDiscount || 0),
        cashAmount,
        onlineAmount,
        orderId: order.id,
      });

      transactions.push(transaction);
    }

    // Save all transactions
    if (transactions.length > 0) {
      await this.transactionRepository.save(transactions);
    }

    return transactions;
  }

  /**
   * Create a new daily sheet - only requires date, auto-generates everything else
   */
  async create(
    createDto: CreateDailySheetDto,
    userId: number,
  ): Promise<DailySheetResponseDto> {
    const sheetDate = new Date(createDto.date);
    sheetDate.setHours(0, 0, 0, 0);

    // Check if sheet already exists for this date
    const existingSheet = await this.dailySheetRepository.findOne({
      where: { date: sheetDate },
    });

    if (existingSheet) {
      throw new ConflictException('Daily sheet already exists for this date');
    }

    // Get previous day's closing balance (if exists)
    const previousDate = new Date(sheetDate);
    previousDate.setDate(previousDate.getDate() - 1);

    let openingBalance = {
      goldWeight: 0,
      goldValue: 0,
      silverWeight: 0,
      silverValue: 0,
      cash: 0,
      online: 0,
      autoCalculated: true,
    };

    // Try to get previous day's sheet for auto-calculation
    const previousSheet = await this.dailySheetRepository.findOne({
      where: { date: previousDate },
    });

    if (previousSheet) {
      // Use previous day's closing balance
      openingBalance = {
        goldWeight: previousSheet.closingBalanceAutoCalculated
          ? Number(previousSheet.closingGoldWeight)
          : Number(previousSheet.closingGoldWeightManual || 0),
        goldValue: previousSheet.closingBalanceAutoCalculated
          ? Number(previousSheet.closingGoldValue)
          : Number(previousSheet.closingGoldValueManual || 0),
        silverWeight: previousSheet.closingBalanceAutoCalculated
          ? Number(previousSheet.closingSilverWeight)
          : Number(previousSheet.closingSilverWeightManual || 0),
        silverValue: previousSheet.closingBalanceAutoCalculated
          ? Number(previousSheet.closingSilverValue)
          : Number(previousSheet.closingSilverValueManual || 0),
        cash: previousSheet.closingBalanceAutoCalculated
          ? Number(previousSheet.closingCash)
          : Number(previousSheet.closingCashManual || 0),
        online: previousSheet.closingBalanceAutoCalculated
          ? Number(previousSheet.closingOnline)
          : Number(previousSheet.closingOnlineManual || 0),
        autoCalculated: true,
      };
    }

    // Create the daily sheet
    const dailySheet = this.dailySheetRepository.create({
      date: sheetDate,
      openingGoldWeight: openingBalance.goldWeight,
      openingGoldValue: openingBalance.goldValue,
      openingSilverWeight: openingBalance.silverWeight,
      openingSilverValue: openingBalance.silverValue,
      openingCash: openingBalance.cash,
      openingOnline: openingBalance.online,
      openingBalanceAutoCalculated: openingBalance.autoCalculated,
      createdBy: userId,
    });

    const savedSheet = await this.dailySheetRepository.save(dailySheet);

    // Auto-generate transactions from orders
    await this.generateTransactionsFromOrders(savedSheet.id, sheetDate);

    // Calculate and update closing balance
    await this.calculateClosingBalance(savedSheet.id);

    return this.findOne(savedSheet.id);
  }

  /**
   * Calculate closing balance from transactions
   */
  async calculateClosingBalance(dailySheetId: number): Promise<void> {
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { id: dailySheetId },
      relations: ['transactions', 'financeEntries', 'expenses'],
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found');
    }

    if (dailySheet.closingBalanceAutoCalculated) {
      // Calculate from transactions
      let totalGoldWeight = Number(dailySheet.openingGoldWeight);
      let totalGoldValue = Number(dailySheet.openingGoldValue);
      let totalSilverWeight = Number(dailySheet.openingSilverWeight);
      let totalSilverValue = Number(dailySheet.openingSilverValue);
      let totalCash = Number(dailySheet.openingCash);
      let totalOnline = Number(dailySheet.openingOnline);

      // Add from transactions (sales reduce stock, exchanges add)
      for (const transaction of dailySheet.transactions || []) {
        totalGoldWeight -= Number(transaction.goldWeight); // Sold
        totalGoldValue -= Number(transaction.goldValue); // Sold
        totalGoldWeight += Number(transaction.oldGoldWeight); // Exchange in
        totalGoldValue += Number(transaction.oldGoldValue); // Exchange in

        totalSilverWeight -= Number(transaction.silverWeight); // Sold
        totalSilverValue -= Number(transaction.silverValue); // Sold
        totalSilverWeight += Number(transaction.oldSilverWeight); // Exchange in
        totalSilverValue += Number(transaction.oldSilverValue); // Exchange in

        totalCash += Number(transaction.cashAmount);
        totalOnline += Number(transaction.onlineAmount);
      }

      // Old inventory movements (sent to karigar/refiner reduces stock, received back increases stock)
      totalGoldWeight -= Number(dailySheet.oldInventorySentOutGoldWeight || 0); // Sent out
      totalGoldValue -= Number(dailySheet.oldInventorySentOutGoldValue || 0); // Sent out
      totalGoldWeight += Number(dailySheet.oldInventoryReceivedGoldWeight || 0); // Received back
      totalGoldValue += Number(dailySheet.oldInventoryReceivedGoldValue || 0); // Received back

      totalSilverWeight -= Number(
        dailySheet.oldInventorySentOutSilverWeight || 0,
      ); // Sent out
      totalSilverValue -= Number(
        dailySheet.oldInventorySentOutSilverValue || 0,
      ); // Sent out
      totalSilverWeight += Number(
        dailySheet.oldInventoryReceivedSilverWeight || 0,
      ); // Received back
      totalSilverValue += Number(
        dailySheet.oldInventoryReceivedSilverValue || 0,
      ); // Received back

      // Add finance IN
      for (const finance of dailySheet.financeEntries || []) {
        if (finance.type === 'IN') {
          totalCash += Number(finance.amount);
        } else if (finance.type === 'OUT') {
          totalCash -= Number(finance.amount);
        }
      }

      // Subtract expenses
      for (const expense of dailySheet.expenses || []) {
        totalCash -= Number(expense.amount);
      }

      // Update closing balance
      dailySheet.closingGoldWeight = Math.max(0, totalGoldWeight);
      dailySheet.closingGoldValue = Math.max(0, totalGoldValue);
      dailySheet.closingSilverWeight = Math.max(0, totalSilverWeight);
      dailySheet.closingSilverValue = Math.max(0, totalSilverValue);
      dailySheet.closingCash = totalCash;
      dailySheet.closingOnline = totalOnline;

      await this.dailySheetRepository.save(dailySheet);
    }
  }

  /**
   * Find all daily sheets with pagination
   */
  async findAll(
    paginationQuery: DailySheetQueryPaginationDto,
  ): Promise<PaginatedResponse<DailySheetListItemDto>> {
    const { page, limit, sortBy, sortOrder, startDate, endDate, isLocked } =
      paginationQuery;
    const skip = (page - 1) * limit;

    const query = this.dailySheetRepository.createQueryBuilder('dailySheet');

    // Apply filters
    if (startDate) {
      query.andWhere('dailySheet.date >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      query.andWhere('dailySheet.date <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (isLocked !== undefined) {
      query.andWhere('dailySheet.isLocked = :isLocked', { isLocked });
    }

    // Apply sorting
    if (sortBy) {
      const sortField = sortBy.includes('.') ? sortBy : `dailySheet.${sortBy}`;
      query.orderBy(sortField, sortOrder);
    } else {
      query.orderBy('dailySheet.date', 'DESC');
    }

    // Get total count
    const totalItems = await query.getCount();

    // Apply pagination
    query.skip(skip).take(limit);

    // Get data
    const data = await query.getMany();

    // Transform to list item DTOs
    const listItems = plainToInstance(DailySheetListItemDto, data, {
      excludeExtraneousValues: true,
    });

    const meta = createPaginationMeta(page, limit, totalItems);

    return { data: listItems, meta };
  }

  /**
   * Find one daily sheet by ID
   */
  async findOne(id: number): Promise<DailySheetResponseDto> {
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { id },
      relations: ['transactions', 'financeEntries', 'expenses', 'user'],
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found');
    }

    // Expand order-linked transactions into per-item rows when possible
    const transactions = dailySheet.transactions || [];
    const orderIds = Array.from(
      new Set(transactions.filter((t) => t.orderId).map((t) => t.orderId)),
    );

    const ordersMap: Record<number, any> = {};
    if (orderIds.length > 0) {
      const orders = await this.orderRepository.find({
        where: orderIds.map((id) => ({ id })),
        relations: [
          'orderItems',
          'orderItems.product',
          'orderItems.product.category',
        ],
      });
      for (const o of orders) ordersMap[o.id] = o;
    }

    const expandedTransactions: any[] = [];

    for (const t of transactions) {
      if (t.orderId && ordersMap[t.orderId]) {
        const order = ordersMap[t.orderId];

        // total metal value to proportionally split exchanges and payments
        const totalItemValue =
          (order.orderItems || []).reduce(
            (s, it) => s + Number(it.totalPrice || 0),
            0,
          ) || 0;

        for (const item of order.orderItems || []) {
          const product = item.product || {};
          const itemValue = Number(item.totalPrice || 0);
          const share = totalItemValue > 0 ? itemValue / totalItemValue : 0;

          const itemGoldWeight =
            product.isBulkItem && product.weightPerItem
              ? Number(product.weightPerItem || 0) * Number(item.quantity || 1)
              : Number(product.grossWeightGm || 0) * Number(item.quantity || 1);

          const makingChargesShare = Number(t.makingCharges || 0) * share;
          const grandTotalShare = Number(t.grandTotal || 0) * share;
          const discountShare = Number(t.discount || 0) * share;
          const cashShare = Number(t.cashAmount || 0) * share;
          const onlineShare = Number(t.onlineAmount || 0) * share;

          const itemOldGoldWeight = Number(t.oldGoldWeight || 0) * share;
          const itemOldGoldValue = Number(t.oldGoldValue || 0) * share;

          expandedTransactions.push({
            id: t.id,
            transactionDate: t.transactionDate,
            description: product.name || t.description,
            productId: product.id,
            categoryId: product.category?.id,
            categoryName: product.category?.name,
            quantity: Number(item.quantity || 1),
            goldWeight: itemGoldWeight,
            goldRate:
              itemGoldWeight > 0
                ? Number(item.totalPrice || 0) / itemGoldWeight
                : undefined,
            goldValue: Number(item.totalPrice || 0),
            silverWeight: 0,
            silverRate: undefined,
            silverValue: 0,
            makingCharges: makingChargesShare,
            oldGoldWeight: itemOldGoldWeight,
            oldGoldValue: itemOldGoldValue,
            oldSilverWeight: 0,
            oldSilverValue: 0,
            grandTotal: grandTotalShare,
            discount: discountShare,
            cashAmount: cashShare,
            onlineAmount: onlineShare,
            orderId: t.orderId,
            createdAt: t.createdAt,
            debit: 0,
            credit: cashShare + onlineShare,
            balance: cashShare + onlineShare,
            finalTotal: grandTotalShare - discountShare,
          });
        }
      } else {
        // Manual transaction or no linked order - keep as is
        expandedTransactions.push({
          id: t.id,
          transactionDate: t.transactionDate,
          description: t.description,
          productId: undefined,
          categoryId: undefined,
          categoryName: undefined,
          quantity: 1,
          goldWeight: t.goldWeight,
          goldRate: t.goldRate,
          goldValue: t.goldValue,
          silverWeight: t.silverWeight,
          silverRate: t.silverRate,
          silverValue: t.silverValue,
          makingCharges: t.makingCharges,
          oldGoldWeight: t.oldGoldWeight,
          oldGoldValue: t.oldGoldValue,
          oldSilverWeight: t.oldSilverWeight,
          oldSilverValue: t.oldSilverValue,
          grandTotal: t.grandTotal,
          discount: t.discount,
          cashAmount: t.cashAmount,
          onlineAmount: t.onlineAmount,
          orderId: t.orderId,
          createdAt: t.createdAt,
          debit: 0,
          credit: Number(t.cashAmount || 0) + Number(t.onlineAmount || 0),
          balance: Number(t.cashAmount || 0) + Number(t.onlineAmount || 0),
          finalTotal: t.grandTotal - (t.discount || 0),
        });
      }
    }

    // Compute category aggregates from expanded transactions
    const categoryMap = new Map();
    for (const et of expandedTransactions) {
      const catId = et.categoryId || 'unattributed';
      const catName = et.categoryName || 'Unattributed';
      const entry = categoryMap.get(catId) || {
        categoryId: et.categoryId,
        categoryName: catName,
        totalItemsSold: 0,
        totalGoldWeight: 0,
        totalOldGoldWeight: 0,
        totalOldGoldValue: 0,
        totalRevenue: 0,
      };
      entry.totalItemsSold += Number(et.quantity || 1);
      entry.totalGoldWeight += Number(et.goldWeight || 0);
      entry.totalOldGoldWeight += Number(et.oldGoldWeight || 0);
      entry.totalOldGoldValue += Number(et.oldGoldValue || 0);
      entry.totalRevenue += Number(et.grandTotal || 0);
      categoryMap.set(catId, entry);
    }

    const categoryAggregates = Array.from(categoryMap.values());

    // Totals
    const totals = expandedTransactions.reduce(
      (acc, et) => {
        acc.totalItemsSold += Number(et.quantity || 1);
        acc.totalGoldWeight += Number(et.goldWeight || 0);
        acc.totalOldGoldWeight += Number(et.oldGoldWeight || 0);
        acc.totalOldGoldValue += Number(et.oldGoldValue || 0);
        acc.totalRevenue += Number(et.grandTotal || 0);
        acc.totalCash += Number(et.cashAmount || 0);
        acc.totalOnline += Number(et.onlineAmount || 0);
        return acc;
      },
      {
        totalItemsSold: 0,
        totalGoldWeight: 0,
        totalOldGoldWeight: 0,
        totalOldGoldValue: 0,
        totalRevenue: 0,
        totalCash: 0,
        totalOnline: 0,
      },
    );

    // Attach computed aggregates to a clone of dailySheet for DTO transformation
    const sheetWithExtras: any = { ...dailySheet };
    sheetWithExtras.transactions = expandedTransactions;
    sheetWithExtras.categoryAggregates = categoryAggregates;
    sheetWithExtras.totals = totals;

    return plainToInstance(DailySheetResponseDto, sheetWithExtras, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Find daily sheet by date
   */
  async findByDate(date: Date): Promise<DailySheetResponseDto> {
    const sheetDate = new Date(date);
    sheetDate.setHours(0, 0, 0, 0);

    const dailySheet = await this.dailySheetRepository.findOne({
      where: { date: sheetDate },
      relations: ['transactions', 'financeEntries', 'expenses', 'user'],
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found for this date');
    }

    return plainToInstance(DailySheetResponseDto, dailySheet, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Get transactions for a date with detailed line items
   */
  async findByDateWithDetails(
    dateString: string,
  ): Promise<DailySheetByDateResponseDto[]> {
    // Parse date (handle both YYYY-MM-DD and DD-MM-YYYY)
    let queryDate: Date;

    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        // Try YYYY-MM-DD first, then DD-MM-YYYY
        if (parseInt(parts[0]) > 31) {
          // YYYY-MM-DD format
          queryDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
          );
        } else {
          // DD-MM-YYYY format
          queryDate = new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
          );
        }
      }
    }

    if (!queryDate) {
      throw new BadRequestException(
        'Invalid date format. Use YYYY-MM-DD or DD-MM-YYYY',
      );
    }

    queryDate.setHours(0, 0, 0, 0);

    // Fetch daily sheet for this date
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { date: queryDate },
      relations: ['transactions'],
    });

    if (!dailySheet) {
      // Return empty array if no daily sheet for this date
      return [];
    }

    // Fetch all transactions for this daily sheet with relations
    const transactions = await this.transactionRepository.find({
      where: { dailySheetId: dailySheet.id },
      relations: [
        'order',
        'order.orderItems',
        'order.orderItems.product',
        'order.orderItems.product.metalPurity',
        'order.orderItems.product.metalType',
        'order.orderItems.product.category',
        'order.exchanges',
        'order.exchanges.metalPurity',
        'order.exchanges.metalPurity.metalType',
      ],
    });

    // Get gold and silver metal type IDs
    const goldType = await this.metalTypeRepository.findOne({
      where: { code: 'GOLD' },
    });
    const silverType = await this.metalTypeRepository.findOne({
      where: { code: 'SILVER' },
    });

    const metalPrices = await this.metalPriceRepository.find({
      where: { isActive: true, effectiveDate: LessThanOrEqual(queryDate) },
      relations: ['metalPurity', 'metalPurity.metalType'],
      order: { effectiveDate: 'DESC' },
    });
    const fallbackMetalPrices = await this.metalPriceRepository.find({
      where: { isActive: true },
      relations: ['metalPurity', 'metalPurity.metalType'],
      order: { effectiveDate: 'DESC' },
    });
    const latestGoldPricePerGram =
      metalPrices.find((mp) => mp.metalPurity?.metalType?.id === goldType?.id)
        ?.pricePerGram ??
      fallbackMetalPrices.find(
        (mp) => mp.metalPurity?.metalType?.id === goldType?.id,
      )?.pricePerGram ??
      0;
    const latestSilverPricePerGram =
      metalPrices.find((mp) => mp.metalPurity?.metalType?.id === silverType?.id)
        ?.pricePerGram ??
      fallbackMetalPrices.find(
        (mp) => mp.metalPurity?.metalType?.id === silverType?.id,
      )?.pricePerGram ??
      0;
    const getRateForPurity = async (purityId?: number) => {
      if (!purityId) return 0;
      const p = await this.metalPriceRepository.findOne({
        where: {
          metalPurityId: purityId,
          isActive: true,
          effectiveDate: LessThanOrEqual(queryDate),
        },
        relations: ['metalPurity'],
        order: { effectiveDate: 'DESC' },
      });
      if (p?.pricePerGram) return Number(p.pricePerGram);
      const latest = await this.metalPriceRepository.findOne({
        where: { metalPurityId: purityId, isActive: true },
        relations: ['metalPurity'],
        order: { effectiveDate: 'DESC' },
      });
      return Number(latest?.pricePerGram || 0);
    };

    // Build transaction list items
    const lineItems: any[] = [];
    let runningBalance = dailySheet.openingCash || 0;
    let totalDebit = 0;
    let totalCredit = 0;

    for (const transaction of transactions) {
      // Handle both orders with order items AND standalone transactions
      if (
        transaction.order &&
        transaction.order.orderItems &&
        transaction.order.orderItems.length > 0
      ) {
        // For each order item, create a line item
        for (const orderItem of transaction.order.orderItems) {
          const product = orderItem.product;
          const category = product?.category;

          let goldWeight = 0;
          let silverWeight = 0;

          if (product?.metalType?.id === goldType?.id) {
            goldWeight = Number(product.grossWeightGm || 0);
          } else if (product?.metalType?.id === silverType?.id) {
            silverWeight = Number(product.grossWeightGm || 0);
          }

          // Old gold/silver from exchanges
          let oldGoldWeight = 0;
          let oldGoldValue = 0;
          let oldSilverWeight = 0;
          let oldSilverValue = 0;

          if (
            transaction.order.exchanges &&
            transaction.order.exchanges.length > 0
          ) {
            for (const exchange of transaction.order.exchanges) {
              if (exchange.metalPurity?.metalType?.id === goldType?.id) {
                oldGoldWeight += Number(exchange.weightGm || 0);
                oldGoldValue += Number(exchange.totalCredit || 0);
              } else if (
                exchange.metalPurity?.metalType?.id === silverType?.id
              ) {
                oldSilverWeight += Number(exchange.weightGm || 0);
                oldSilverValue += Number(exchange.totalCredit || 0);
              }
            }
          }

          const grandTotal = Number(orderItem.totalPrice || 0);
          const discount = Number(transaction.discount || 0);
          const finalTotal = grandTotal - discount;

          const credit = finalTotal;
          const cashAmount = Number(transaction.cashAmount || 0);
          const onlineAmount = Number(transaction.onlineAmount || 0);
          const debitCalc = cashAmount + onlineAmount;

          runningBalance = runningBalance - debitCalc + credit;
          totalDebit += debitCalc;
          totalCredit += credit;

          const itemRatePerGram =
            product?.metalType?.id === goldType?.id
              ? (await getRateForPurity(product?.metalPurity?.id)) ||
                latestGoldPricePerGram
              : product?.metalType?.id === silverType?.id
                ? (await getRateForPurity(product?.metalPurity?.id)) ||
                  latestSilverPricePerGram
                : 0;
          const goldPricePerGram =
            product?.metalType?.id === goldType?.id ? itemRatePerGram : 0;
          const silverPricePerGram =
            product?.metalType?.id === silverType?.id ? itemRatePerGram : 0;

          lineItems.push({
            description: transaction.description || '',
            category: category?.name || '',
            weights: {
              goldWeight,
              goldPricePerGram: Number(goldPricePerGram),
              silverWeight,
              silverPricePerGram: Number(silverPricePerGram),
            },
            oneGramRate: Number(itemRatePerGram),
            makingChargesTotal:
              Number(product?.makingChargesAmount || 0),
            oldGoldWeight,
            oldGoldValue,
            oldSilverWeight,
            oldSilverValue,
            grandTotal,
            discount,
            finalTotal,
            online: onlineAmount,
            cash: cashAmount,
            credit,
            balance: runningBalance,
          });
        }
      } else {
        // Handle standalone transactions (without orders)
        const goldWeight = Number(transaction.goldWeight || 0);
        const silverWeight = Number(transaction.silverWeight || 0);
        const oldGoldWeight = Number(transaction.oldGoldWeight || 0);
        const oldGoldValue = Number(transaction.oldGoldValue || 0);
        const oldSilverWeight = Number(transaction.oldSilverWeight || 0);
        const oldSilverValue = Number(transaction.oldSilverValue || 0);

        const grandTotal = Number(transaction.grandTotal || 0);
        const discount = Number(transaction.discount || 0);
        const finalTotal = grandTotal - discount;

        const credit = finalTotal;
        const cashAmount = Number(transaction.cashAmount || 0);
        const onlineAmount = Number(transaction.onlineAmount || 0);
        const debitCalc = cashAmount + onlineAmount;

        runningBalance = runningBalance - debitCalc + credit;
        totalDebit += debitCalc;
        totalCredit += credit;

        const standaloneGoldRate =
          Number(transaction.goldRate || 0) || latestGoldPricePerGram;
        const standaloneSilverRate =
          Number(transaction.silverRate || 0) || latestSilverPricePerGram;
        const oneGramRate =
          goldWeight > 0
            ? standaloneGoldRate
            : silverWeight > 0
              ? standaloneSilverRate
              : 0;

        lineItems.push({
          description: transaction.description || '',
          category: '', // No category for standalone transactions
          weights: {
            goldWeight,
            goldPricePerGram: Number(standaloneGoldRate),
            silverWeight,
            silverPricePerGram: Number(standaloneSilverRate),
          },
          oneGramRate: Number(oneGramRate),
          makingChargesTotal: Number(transaction.makingCharges || 0),
          oldGoldWeight,
          oldGoldValue,
          oldSilverWeight,
          oldSilverValue,
          grandTotal,
          discount,
          finalTotal,
          online: onlineAmount,
          cash: cashAmount,
          credit,
          balance: runningBalance,
        });
      }
    }

    const expenses = await this.dailySheetExpenseRepository.find({
      where: { dailySheetId: dailySheet.id },
    });
    for (const e of expenses || []) {
      const amount = Number(e.amount || 0);
      runningBalance = runningBalance - amount;
      totalDebit += amount;
      lineItems.push({
        description: e.description || '',
        category: 'Expense',
        weights: {
          goldWeight: 0,
          goldPricePerGram: 0,
          silverWeight: 0,
          silverPricePerGram: 0,
        },
        oneGramRate: 0,
        makingChargesTotal: 0,
        oldGoldWeight: 0,
        oldGoldValue: 0,
        oldSilverWeight: 0,
        oldSilverValue: 0,
        grandTotal: amount,
        discount: 0,
        finalTotal: amount,
        online: 0,
        cash: amount,
        credit: 0,
        balance: runningBalance,
      });
    }

    // Format date as DD-MM-YYYY
    const day = String(queryDate.getDate()).padStart(2, '0');
    const month = String(queryDate.getMonth() + 1).padStart(2, '0');
    const year = queryDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    // Return as array with single day group
    return [
      plainToInstance(
        DailySheetByDateResponseDto,
        {
          date: formattedDate,
          openingCash: Number(dailySheet.openingCash || 0).toFixed(2),
          totalCredit,
          totalDebit,
          closingCash: Number(dailySheet.closingCash || 0).toFixed(2),
          status: 'completed',
          list: lineItems,
        },
        {
          excludeExtraneousValues: true,
        },
      ),
    ];
  }

  /**
   * Get monthly balance sheet - aggregates all daily sheets for a month
   */
  async getMonthlyBalanceSheet(
    year: number,
    month: number,
  ): Promise<MonthlyBalanceSheetResponseDto> {
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0); // Last day of month
    endDate.setHours(23, 59, 59, 999);

    // Get all daily sheets for the month
    const dailySheets = await this.dailySheetRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['transactions', 'financeEntries', 'expenses'],
      order: { date: 'ASC' },
    });

    // Get month name
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
    const monthName = `${monthNames[month - 1]} ${year}`;
    const totalDays = new Date(year, month, 0).getDate();

    // Initialize totals
    let openingGoldWeight = 0;
    let openingGoldValue = 0;
    let openingSilverWeight = 0;
    let openingSilverValue = 0;
    let openingCash = 0;
    let openingOnline = 0;

    let closingGoldWeight = 0;
    let closingGoldValue = 0;
    let closingSilverWeight = 0;
    let closingSilverValue = 0;
    let closingCash = 0;
    let closingOnline = 0;

    let totalSalesGoldWeight = 0;
    let totalSalesGoldValue = 0;
    let totalSalesSilverWeight = 0;
    let totalSalesSilverValue = 0;
    let totalExchangesGoldWeight = 0;
    let totalExchangesGoldValue = 0;
    let totalExchangesSilverWeight = 0;
    let totalExchangesSilverValue = 0;
    let totalMakingCharges = 0;
    let totalSalesAmount = 0;
    let totalDiscount = 0;

    let totalOldInventorySentOutGoldWeight = 0;
    let totalOldInventorySentOutGoldValue = 0;
    let totalOldInventorySentOutSilverWeight = 0;
    let totalOldInventorySentOutSilverValue = 0;
    let totalOldInventoryReceivedGoldWeight = 0;
    let totalOldInventoryReceivedGoldValue = 0;
    let totalOldInventoryReceivedSilverWeight = 0;
    let totalOldInventoryReceivedSilverValue = 0;

    let totalFinanceIn = 0;
    let totalFinanceOut = 0;
    let totalExpenses = 0;

    // Process each daily sheet
    for (const sheet of dailySheets) {
      // Get opening balance from first sheet
      if (sheet === dailySheets[0]) {
        openingGoldWeight = Number(sheet.openingGoldWeight);
        openingGoldValue = Number(sheet.openingGoldValue);
        openingSilverWeight = Number(sheet.openingSilverWeight);
        openingSilverValue = Number(sheet.openingSilverValue);
        openingCash = Number(sheet.openingCash);
        openingOnline = Number(sheet.openingOnline);
      }

      // Get closing balance from last sheet
      if (sheet === dailySheets[dailySheets.length - 1]) {
        closingGoldWeight = sheet.closingBalanceAutoCalculated
          ? Number(sheet.closingGoldWeight)
          : Number(sheet.closingGoldWeightManual || 0);
        closingGoldValue = sheet.closingBalanceAutoCalculated
          ? Number(sheet.closingGoldValue)
          : Number(sheet.closingGoldValueManual || 0);
        closingSilverWeight = sheet.closingBalanceAutoCalculated
          ? Number(sheet.closingSilverWeight)
          : Number(sheet.closingSilverWeightManual || 0);
        closingSilverValue = sheet.closingBalanceAutoCalculated
          ? Number(sheet.closingSilverValue)
          : Number(sheet.closingSilverValueManual || 0);
        closingCash = sheet.closingBalanceAutoCalculated
          ? Number(sheet.closingCash)
          : Number(sheet.closingCashManual || 0);
        closingOnline = sheet.closingBalanceAutoCalculated
          ? Number(sheet.closingOnline)
          : Number(sheet.closingOnlineManual || 0);
      }

      // Aggregate transactions
      for (const transaction of sheet.transactions || []) {
        totalSalesGoldWeight += Number(transaction.goldWeight);
        totalSalesGoldValue += Number(transaction.goldValue);
        totalSalesSilverWeight += Number(transaction.silverWeight);
        totalSalesSilverValue += Number(transaction.silverValue);
        totalExchangesGoldWeight += Number(transaction.oldGoldWeight);
        totalExchangesGoldValue += Number(transaction.oldGoldValue);
        totalExchangesSilverWeight += Number(transaction.oldSilverWeight);
        totalExchangesSilverValue += Number(transaction.oldSilverValue);
        totalMakingCharges += Number(transaction.makingCharges);
        totalSalesAmount += Number(transaction.grandTotal);
        totalDiscount += Number(transaction.discount);
      }

      // Aggregate old inventory movements
      totalOldInventorySentOutGoldWeight += Number(
        sheet.oldInventorySentOutGoldWeight || 0,
      );
      totalOldInventorySentOutGoldValue += Number(
        sheet.oldInventorySentOutGoldValue || 0,
      );
      totalOldInventorySentOutSilverWeight += Number(
        sheet.oldInventorySentOutSilverWeight || 0,
      );
      totalOldInventorySentOutSilverValue += Number(
        sheet.oldInventorySentOutSilverValue || 0,
      );
      totalOldInventoryReceivedGoldWeight += Number(
        sheet.oldInventoryReceivedGoldWeight || 0,
      );
      totalOldInventoryReceivedGoldValue += Number(
        sheet.oldInventoryReceivedGoldValue || 0,
      );
      totalOldInventoryReceivedSilverWeight += Number(
        sheet.oldInventoryReceivedSilverWeight || 0,
      );
      totalOldInventoryReceivedSilverValue += Number(
        sheet.oldInventoryReceivedSilverValue || 0,
      );

      // Aggregate finance entries
      for (const finance of sheet.financeEntries || []) {
        if (finance.type === 'IN') {
          totalFinanceIn += Number(finance.amount);
        } else if (finance.type === 'OUT') {
          totalFinanceOut += Number(finance.amount);
        }
      }

      // Aggregate expenses
      for (const expense of sheet.expenses || []) {
        totalExpenses += Number(expense.amount);
      }
    }

    // Calculate net cash flow
    const netCashFlow = totalFinanceIn - totalFinanceOut - totalExpenses;

    // Transform daily sheets to list items
    const dailySheetListItems = plainToInstance(
      DailySheetListItemDto,
      dailySheets,
      {
        excludeExtraneousValues: true,
      },
    );

    // Build response
    const response: MonthlyBalanceSheetResponseDto = {
      year,
      month,
      monthName,
      totalDays,
      sheetsCount: dailySheets.length,
      openingGoldWeight,
      openingGoldValue,
      openingSilverWeight,
      openingSilverValue,
      openingCash,
      openingOnline,
      closingGoldWeight,
      closingGoldValue,
      closingSilverWeight,
      closingSilverValue,
      closingCash,
      closingOnline,
      totalSalesGoldWeight,
      totalSalesGoldValue,
      totalSalesSilverWeight,
      totalSalesSilverValue,
      totalExchangesGoldWeight,
      totalExchangesGoldValue,
      totalExchangesSilverWeight,
      totalExchangesSilverValue,
      totalMakingCharges,
      totalSalesAmount,
      totalDiscount,
      totalOldInventorySentOutGoldWeight,
      totalOldInventorySentOutGoldValue,
      totalOldInventorySentOutSilverWeight,
      totalOldInventorySentOutSilverValue,
      totalOldInventoryReceivedGoldWeight,
      totalOldInventoryReceivedGoldValue,
      totalOldInventoryReceivedSilverWeight,
      totalOldInventoryReceivedSilverValue,
      totalFinanceIn,
      totalFinanceOut,
      totalExpenses,
      netCashFlow,
      dailySheets: dailySheetListItems,
    };

    return plainToInstance(MonthlyBalanceSheetResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Export monthly balance sheet to Excel
   */
  async exportMonthlyBalanceSheetToExcel(
    year: number,
    month: number,
  ): Promise<ExcelJS.Workbook> {
    const monthlyData = await this.getMonthlyBalanceSheet(year, month);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Balance Sheet');

    // Title
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value =
      `Monthly Balance Sheet - ${monthlyData.monthName}`;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getRow(1).height = 25;

    let currentRow = 3;

    // Summary Section
    worksheet.getCell(`A${currentRow}`).value = 'Summary';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Total Days:';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.totalDays;
    worksheet.getCell(`C${currentRow}`).value = 'Sheets Available:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.sheetsCount;
    currentRow += 2;

    // Opening Balance Section
    worksheet.getCell(`A${currentRow}`).value =
      'Opening Balance (First Day of Month)';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Gold Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.openingGoldWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Gold Value:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.openingGoldValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Silver Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.openingSilverWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Silver Value:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.openingSilverValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Cash:';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.openingCash;
    worksheet.getCell(`C${currentRow}`).value = 'Online:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.openingOnline;
    currentRow += 2;

    // Closing Balance Section
    worksheet.getCell(`A${currentRow}`).value =
      'Closing Balance (Last Day of Month)';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Gold Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.closingGoldWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Gold Value:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.closingGoldValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Silver Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.closingSilverWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Silver Value:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.closingSilverValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Cash:';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.closingCash;
    worksheet.getCell(`C${currentRow}`).value = 'Online:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.closingOnline;
    currentRow += 2;

    // Monthly Totals - Sales & Exchanges
    worksheet.getCell(`A${currentRow}`).value = 'Monthly Totals';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Sales Gold Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value =
      monthlyData.totalSalesGoldWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Sales Gold Value:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.totalSalesGoldValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Sales Silver Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value =
      monthlyData.totalSalesSilverWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Sales Silver Value:';
    worksheet.getCell(`D${currentRow}`).value =
      monthlyData.totalSalesSilverValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Exchange Gold Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value =
      monthlyData.totalExchangesGoldWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Exchange Gold Value:';
    worksheet.getCell(`D${currentRow}`).value =
      monthlyData.totalExchangesGoldValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Exchange Silver Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value =
      monthlyData.totalExchangesSilverWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Exchange Silver Value:';
    worksheet.getCell(`D${currentRow}`).value =
      monthlyData.totalExchangesSilverValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Total Making Charges:';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.totalMakingCharges;
    worksheet.getCell(`C${currentRow}`).value = 'Total Sales Amount:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.totalSalesAmount;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Total Discount:';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.totalDiscount;
    currentRow += 2;

    // Old Inventory Movements Section
    worksheet.getCell(`A${currentRow}`).value = 'Old Inventory Movements';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Sent Out to Karigar/Refiner:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Gold Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value =
      monthlyData.totalOldInventorySentOutGoldWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Gold Value:';
    worksheet.getCell(`D${currentRow}`).value =
      monthlyData.totalOldInventorySentOutGoldValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Silver Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value =
      monthlyData.totalOldInventorySentOutSilverWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Silver Value:';
    worksheet.getCell(`D${currentRow}`).value =
      monthlyData.totalOldInventorySentOutSilverValue;
    currentRow += 2;

    worksheet.getCell(`A${currentRow}`).value =
      'Received Back from Karigar/Refiner:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Gold Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value =
      monthlyData.totalOldInventoryReceivedGoldWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Gold Value:';
    worksheet.getCell(`D${currentRow}`).value =
      monthlyData.totalOldInventoryReceivedGoldValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Silver Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value =
      monthlyData.totalOldInventoryReceivedSilverWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Silver Value:';
    worksheet.getCell(`D${currentRow}`).value =
      monthlyData.totalOldInventoryReceivedSilverValue;
    currentRow += 2;

    // Finance & Expenses Section
    worksheet.getCell(`A${currentRow}`).value = 'Finance & Expenses';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Total Finance IN:';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.totalFinanceIn;
    worksheet.getCell(`C${currentRow}`).value = 'Total Finance OUT:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.totalFinanceOut;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Total Expenses:';
    worksheet.getCell(`B${currentRow}`).value = monthlyData.totalExpenses;
    worksheet.getCell(`C${currentRow}`).value = 'Net Cash Flow:';
    worksheet.getCell(`D${currentRow}`).value = monthlyData.netCashFlow;
    currentRow += 2;

    // Daily Sheets Summary
    if (monthlyData.dailySheets && monthlyData.dailySheets.length > 0) {
      worksheet.getCell(`A${currentRow}`).value = 'Daily Sheets Summary';
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;

      const summaryHeaders = [
        'Date',
        'Gold Wt',
        'Gold Val',
        'Silver Wt',
        'Silver Val',
        'Cash',
        'Online',
      ];
      worksheet.getRow(currentRow).values = summaryHeaders;
      worksheet.getRow(currentRow).font = { bold: true };
      worksheet.getRow(currentRow).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      currentRow++;

      for (const sheet of monthlyData.dailySheets) {
        const sheetDate = new Date(sheet.date).toLocaleDateString('en-GB');
        worksheet.getRow(currentRow).values = [
          sheetDate,
          sheet.closingGoldWeight,
          sheet.closingGoldValue,
          sheet.closingSilverWeight,
          sheet.closingSilverValue,
          sheet.closingCash,
          sheet.closingOnline,
        ];
        currentRow++;
      }
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    return workbook;
  }

  /**
   * Update daily sheet
   */
  async update(
    id: number,
    updateDto: UpdateDailySheetDto,
  ): Promise<DailySheetResponseDto> {
    // Load daily sheet without relations to avoid cascade update issues
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { id },
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found');
    }

    if (dailySheet.isLocked && updateDto.isLocked !== false) {
      throw new BadRequestException('Cannot modify locked daily sheet');
    }

    // Update basic fields
    if (updateDto.notes !== undefined) {
      dailySheet.notes = updateDto.notes;
    }

    if (updateDto.isLocked !== undefined) {
      dailySheet.isLocked = updateDto.isLocked;
    }

    // Update closing balance manual overrides
    if (updateDto.closingBalanceAutoCalculated !== undefined) {
      dailySheet.closingBalanceAutoCalculated =
        updateDto.closingBalanceAutoCalculated;
    }

    if (updateDto.closingGoldWeightManual !== undefined) {
      dailySheet.closingGoldWeightManual = updateDto.closingGoldWeightManual;
    }

    if (updateDto.closingGoldValueManual !== undefined) {
      dailySheet.closingGoldValueManual = updateDto.closingGoldValueManual;
    }

    if (updateDto.closingSilverWeightManual !== undefined) {
      dailySheet.closingSilverWeightManual =
        updateDto.closingSilverWeightManual;
    }

    if (updateDto.closingSilverValueManual !== undefined) {
      dailySheet.closingSilverValueManual = updateDto.closingSilverValueManual;
    }

    if (updateDto.closingCashManual !== undefined) {
      dailySheet.closingCashManual = updateDto.closingCashManual;
    }

    if (updateDto.closingOnlineManual !== undefined) {
      dailySheet.closingOnlineManual = updateDto.closingOnlineManual;
    }

    // Update old inventory movements
    if (updateDto.oldInventorySentOutGoldWeight !== undefined) {
      dailySheet.oldInventorySentOutGoldWeight =
        updateDto.oldInventorySentOutGoldWeight;
    }

    if (updateDto.oldInventorySentOutGoldValue !== undefined) {
      dailySheet.oldInventorySentOutGoldValue =
        updateDto.oldInventorySentOutGoldValue;
    }

    if (updateDto.oldInventorySentOutSilverWeight !== undefined) {
      dailySheet.oldInventorySentOutSilverWeight =
        updateDto.oldInventorySentOutSilverWeight;
    }

    if (updateDto.oldInventorySentOutSilverValue !== undefined) {
      dailySheet.oldInventorySentOutSilverValue =
        updateDto.oldInventorySentOutSilverValue;
    }

    if (updateDto.oldInventoryReceivedGoldWeight !== undefined) {
      dailySheet.oldInventoryReceivedGoldWeight =
        updateDto.oldInventoryReceivedGoldWeight;
    }

    if (updateDto.oldInventoryReceivedGoldValue !== undefined) {
      dailySheet.oldInventoryReceivedGoldValue =
        updateDto.oldInventoryReceivedGoldValue;
    }

    if (updateDto.oldInventoryReceivedSilverWeight !== undefined) {
      dailySheet.oldInventoryReceivedSilverWeight =
        updateDto.oldInventoryReceivedSilverWeight;
    }

    if (updateDto.oldInventoryReceivedSilverValue !== undefined) {
      dailySheet.oldInventoryReceivedSilverValue =
        updateDto.oldInventoryReceivedSilverValue;
    }

    // Handle transactions (update existing or create new)
    if (updateDto.transactions && updateDto.transactions.length > 0) {
      for (const t of updateDto.transactions) {
        // Validate orderId if provided
        let orderId = t.orderId;
        if (orderId) {
          const orderExists = await this.orderRepository.findOne({
            where: { id: orderId },
          });
          if (!orderExists) {
            orderId = null;
          }
        }

        if (t.id) {
          // Update existing transaction
          const existingTransaction = await this.transactionRepository.findOne({
            where: { id: t.id, dailySheetId: id },
          });

          if (existingTransaction) {
            // Update fields
            existingTransaction.transactionDate = new Date(t.transactionDate);
            existingTransaction.description = t.description;
            existingTransaction.goldWeight = t.goldWeight ?? 0;
            existingTransaction.goldRate = t.goldRate;
            existingTransaction.goldValue = t.goldValue ?? 0;
            existingTransaction.silverWeight = t.silverWeight ?? 0;
            existingTransaction.silverRate = t.silverRate;
            existingTransaction.silverValue = t.silverValue ?? 0;
            existingTransaction.makingCharges = t.makingCharges ?? 0;
            existingTransaction.oldGoldWeight = t.oldGoldWeight ?? 0;
            existingTransaction.oldGoldValue = t.oldGoldValue ?? 0;
            existingTransaction.oldSilverWeight = t.oldSilverWeight ?? 0;
            existingTransaction.oldSilverValue = t.oldSilverValue ?? 0;
            existingTransaction.grandTotal = t.grandTotal;
            existingTransaction.discount = t.discount ?? 0;
            existingTransaction.cashAmount = t.cashAmount ?? 0;
            existingTransaction.onlineAmount = t.onlineAmount ?? 0;
            existingTransaction.orderId = orderId || null;

            await this.transactionRepository.save(existingTransaction);
          }
        } else {
          // Create new transaction
          const newTransaction = this.transactionRepository.create({
            ...t,
            dailySheetId: id,
            orderId: orderId || null,
            transactionDate: new Date(t.transactionDate),
          });
          await this.transactionRepository.save(newTransaction);
        }
      }
    }

    // Handle finance entries (update existing or create new)
    if (updateDto.financeEntries && updateDto.financeEntries.length > 0) {
      for (const f of updateDto.financeEntries) {
        if (f.id) {
          // Update existing finance entry
          const existingEntry = await this.financeEntryRepository.findOne({
            where: { id: f.id, dailySheetId: id },
          });

          if (existingEntry) {
            existingEntry.type = f.type;
            existingEntry.description = f.description;
            existingEntry.amount = f.amount;
            await this.financeEntryRepository.save(existingEntry);
          }
        } else {
          // Create new finance entry
          const newEntry = this.financeEntryRepository.create({
            ...f,
            dailySheetId: id,
          });
          await this.financeEntryRepository.save(newEntry);
        }
      }
    }

    // Handle expenses (update existing or create new)
    if (updateDto.expenses && updateDto.expenses.length > 0) {
      for (const e of updateDto.expenses) {
        if (e.id) {
          // Update existing expense
          const existingExpense =
            await this.dailySheetExpenseRepository.findOne({
              where: { id: e.id, dailySheetId: id },
            });

          if (existingExpense) {
            existingExpense.description = e.description;
            existingExpense.amount = e.amount;
            existingExpense.expenseId = e.expenseId;
            await this.dailySheetExpenseRepository.save(existingExpense);
          }
        } else {
          // Create new expense
          const newExpense = this.dailySheetExpenseRepository.create({
            ...e,
            dailySheetId: id,
          });
          await this.dailySheetExpenseRepository.save(newExpense);
        }
      }
    }

    // Save the daily sheet first (without relations)
    await this.dailySheetRepository.save(dailySheet);

    // Recalculate closing balance if auto-calculated
    if (dailySheet.closingBalanceAutoCalculated) {
      await this.calculateClosingBalance(id);
    }

    // Return the updated sheet with all relations
    return this.findOne(id);
  }

  /**
   * Delete daily sheet and all related data
   */
  async remove(id: number): Promise<void> {
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { id },
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found');
    }

    if (dailySheet.isLocked) {
      throw new BadRequestException('Cannot delete locked daily sheet');
    }

    // Delete related data (cascade should handle this, but being explicit)
    await this.transactionRepository.delete({ dailySheetId: id });
    await this.financeEntryRepository.delete({ dailySheetId: id });
    await this.dailySheetExpenseRepository.delete({ dailySheetId: id });

    // Delete the sheet
    await this.dailySheetRepository.remove(dailySheet);
  }

  /**
   * Delete a transaction from daily sheet
   */
  async deleteTransaction(
    dailySheetId: number,
    transactionId: number,
  ): Promise<void> {
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { id: dailySheetId },
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found');
    }

    if (dailySheet.isLocked) {
      throw new BadRequestException('Cannot modify locked daily sheet');
    }

    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, dailySheetId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.transactionRepository.remove(transaction);

    // Recalculate closing balance
    if (dailySheet.closingBalanceAutoCalculated) {
      await this.calculateClosingBalance(dailySheetId);
    }
  }

  /**
   * Refresh daily sheet - regenerate transactions from orders and recalculate balance
   */
  async refresh(dailySheetId: number): Promise<DailySheetResponseDto> {
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { id: dailySheetId },
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found');
    }

    if (dailySheet.isLocked) {
      throw new BadRequestException('Cannot refresh locked daily sheet');
    }

    // Regenerate transactions from orders for the sheet date
    await this.generateTransactionsFromOrders(dailySheetId, dailySheet.date);

    // Recalculate closing balance
    if (dailySheet.closingBalanceAutoCalculated) {
      await this.calculateClosingBalance(dailySheetId);
    }

    return this.findOne(dailySheetId);
  }

  /**
   * Delete a finance entry from daily sheet
   */
  async deleteFinanceEntry(
    dailySheetId: number,
    entryId: number,
  ): Promise<void> {
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { id: dailySheetId },
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found');
    }

    if (dailySheet.isLocked) {
      throw new BadRequestException('Cannot modify locked daily sheet');
    }

    const financeEntry = await this.financeEntryRepository.findOne({
      where: { id: entryId, dailySheetId },
    });

    if (!financeEntry) {
      throw new NotFoundException('Finance entry not found');
    }

    await this.financeEntryRepository.remove(financeEntry);

    // Recalculate closing balance
    if (dailySheet.closingBalanceAutoCalculated) {
      await this.calculateClosingBalance(dailySheetId);
    }
  }

  /**
   * Delete an expense from daily sheet
   */
  async deleteExpense(dailySheetId: number, expenseId: number): Promise<void> {
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { id: dailySheetId },
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found');
    }

    if (dailySheet.isLocked) {
      throw new BadRequestException('Cannot modify locked daily sheet');
    }

    const expense = await this.dailySheetExpenseRepository.findOne({
      where: { id: expenseId, dailySheetId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    await this.dailySheetExpenseRepository.remove(expense);

    // Recalculate closing balance
    if (dailySheet.closingBalanceAutoCalculated) {
      await this.calculateClosingBalance(dailySheetId);
    }
  }

  /**
   * Export daily sheet to Excel
   */
  async exportToExcel(id: number): Promise<ExcelJS.Workbook> {
    const dailySheet = await this.dailySheetRepository.findOne({
      where: { id },
      relations: ['transactions', 'financeEntries', 'expenses', 'user'],
    });

    if (!dailySheet) {
      throw new NotFoundException('Daily sheet not found');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daily Sheet');

    // Format date
    const sheetDate = new Date(dailySheet.date);
    const dateStr = sheetDate.toLocaleDateString('en-GB'); // DD/MM/YYYY

    // Title
    worksheet.mergeCells('A1:L1');
    worksheet.getCell('A1').value = `Daily Sheet - ${dateStr}`;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getRow(1).height = 25;

    // Opening Balance Section
    let currentRow = 3;
    worksheet.getCell(`A${currentRow}`).value = 'Opening Balance';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Gold Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = Number(
      dailySheet.openingGoldWeight,
    );
    worksheet.getCell(`C${currentRow}`).value = 'Gold Value:';
    worksheet.getCell(`D${currentRow}`).value = Number(
      dailySheet.openingGoldValue,
    );
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Silver Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = Number(
      dailySheet.openingSilverWeight,
    );
    worksheet.getCell(`C${currentRow}`).value = 'Silver Value:';
    worksheet.getCell(`D${currentRow}`).value = Number(
      dailySheet.openingSilverValue,
    );
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Cash:';
    worksheet.getCell(`B${currentRow}`).value = Number(dailySheet.openingCash);
    worksheet.getCell(`C${currentRow}`).value = 'Online:';
    worksheet.getCell(`D${currentRow}`).value = Number(
      dailySheet.openingOnline,
    );
    currentRow += 2;

    // Transactions Section
    worksheet.getCell(`A${currentRow}`).value = 'Transactions';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    // Transaction headers
    const transHeaders = [
      'Date',
      'Description',
      'Gold Wt',
      'Gold Rate',
      'Gold Value',
      'Silver Wt',
      'Silver Rate',
      'Silver Value',
      'M/C',
      'OG Wt',
      'OG Value',
      'OS Wt',
      'OS Value',
      'Grand Total',
      'Discount',
      'Cash',
      'Online',
    ];

    worksheet.getRow(currentRow).values = transHeaders;
    worksheet.getRow(currentRow).font = { bold: true };
    worksheet.getRow(currentRow).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    currentRow++;

    // Transaction rows
    for (const trans of dailySheet.transactions || []) {
      const transDate = new Date(trans.transactionDate).toLocaleDateString(
        'en-GB',
      );
      worksheet.getRow(currentRow).values = [
        transDate,
        trans.description,
        Number(trans.goldWeight),
        trans.goldRate ? Number(trans.goldRate) : '',
        Number(trans.goldValue),
        Number(trans.silverWeight),
        trans.silverRate ? Number(trans.silverRate) : '',
        Number(trans.silverValue),
        Number(trans.makingCharges),
        Number(trans.oldGoldWeight),
        Number(trans.oldGoldValue),
        Number(trans.oldSilverWeight),
        Number(trans.oldSilverValue),
        Number(trans.grandTotal),
        Number(trans.discount),
        Number(trans.cashAmount),
        Number(trans.onlineAmount),
      ];
      currentRow++;
    }

    // Transaction totals
    const transTotals = dailySheet.transactions?.reduce(
      (acc, trans) => ({
        goldWeight: acc.goldWeight + Number(trans.goldWeight),
        goldValue: acc.goldValue + Number(trans.goldValue),
        silverWeight: acc.silverWeight + Number(trans.silverWeight),
        silverValue: acc.silverValue + Number(trans.silverValue),
        makingCharges: acc.makingCharges + Number(trans.makingCharges),
        oldGoldWeight: acc.oldGoldWeight + Number(trans.oldGoldWeight),
        oldGoldValue: acc.oldGoldValue + Number(trans.oldGoldValue),
        oldSilverWeight: acc.oldSilverWeight + Number(trans.oldSilverWeight),
        oldSilverValue: acc.oldSilverValue + Number(trans.oldSilverValue),
        grandTotal: acc.grandTotal + Number(trans.grandTotal),
        discount: acc.discount + Number(trans.discount),
        cash: acc.cash + Number(trans.cashAmount),
        online: acc.online + Number(trans.onlineAmount),
      }),
      {
        goldWeight: 0,
        goldValue: 0,
        silverWeight: 0,
        silverValue: 0,
        makingCharges: 0,
        oldGoldWeight: 0,
        oldGoldValue: 0,
        oldSilverWeight: 0,
        oldSilverValue: 0,
        grandTotal: 0,
        discount: 0,
        cash: 0,
        online: 0,
      },
    ) || {
      goldWeight: 0,
      goldValue: 0,
      silverWeight: 0,
      silverValue: 0,
      makingCharges: 0,
      oldGoldWeight: 0,
      oldGoldValue: 0,
      oldSilverWeight: 0,
      oldSilverValue: 0,
      grandTotal: 0,
      discount: 0,
      cash: 0,
      online: 0,
    };

    worksheet.getRow(currentRow).values = [
      'TOTAL',
      '',
      transTotals.goldWeight,
      '',
      transTotals.goldValue,
      transTotals.silverWeight,
      '',
      transTotals.silverValue,
      transTotals.makingCharges,
      transTotals.oldGoldWeight,
      transTotals.oldGoldValue,
      transTotals.oldSilverWeight,
      transTotals.oldSilverValue,
      transTotals.grandTotal,
      transTotals.discount,
      transTotals.cash,
      transTotals.online,
    ];
    worksheet.getRow(currentRow).font = { bold: true };
    currentRow += 2;

    // Finance Entries Section
    worksheet.getCell(`A${currentRow}`).value = 'Finance';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    const financeHeaders = ['Type', 'Description', 'Amount'];
    worksheet.getRow(currentRow).values = financeHeaders;
    worksheet.getRow(currentRow).font = { bold: true };
    worksheet.getRow(currentRow).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    currentRow++;

    for (const finance of dailySheet.financeEntries || []) {
      worksheet.getRow(currentRow).values = [
        finance.type,
        finance.description,
        Number(finance.amount),
      ];
      currentRow++;
    }

    const financeTotals = dailySheet.financeEntries?.reduce(
      (acc, f) => ({
        in: acc.in + (f.type === 'IN' ? Number(f.amount) : 0),
        out: acc.out + (f.type === 'OUT' ? Number(f.amount) : 0),
      }),
      { in: 0, out: 0 },
    ) || { in: 0, out: 0 };

    worksheet.getRow(currentRow).values = [
      'TOTAL',
      `IN: ${financeTotals.in}, OUT: ${financeTotals.out}`,
      financeTotals.in - financeTotals.out,
    ];
    worksheet.getRow(currentRow).font = { bold: true };
    currentRow += 2;

    // Expenses Section
    worksheet.getCell(`A${currentRow}`).value = 'Expenses';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    const expenseHeaders = ['Description', 'Amount'];
    worksheet.getRow(currentRow).values = expenseHeaders;
    worksheet.getRow(currentRow).font = { bold: true };
    worksheet.getRow(currentRow).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    currentRow++;

    for (const expense of dailySheet.expenses || []) {
      worksheet.getRow(currentRow).values = [
        expense.description,
        Number(expense.amount),
      ];
      currentRow++;
    }

    const expenseTotal =
      dailySheet.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    worksheet.getRow(currentRow).values = ['TOTAL', expenseTotal];
    worksheet.getRow(currentRow).font = { bold: true };
    currentRow += 2;

    // Old Inventory Movements Section
    worksheet.getCell(`A${currentRow}`).value = 'Old Inventory Movements';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Sent Out to Karigar/Refiner:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Gold Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = Number(
      dailySheet.oldInventorySentOutGoldWeight || 0,
    );
    worksheet.getCell(`C${currentRow}`).value = 'Gold Value:';
    worksheet.getCell(`D${currentRow}`).value = Number(
      dailySheet.oldInventorySentOutGoldValue || 0,
    );
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Silver Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = Number(
      dailySheet.oldInventorySentOutSilverWeight || 0,
    );
    worksheet.getCell(`C${currentRow}`).value = 'Silver Value:';
    worksheet.getCell(`D${currentRow}`).value = Number(
      dailySheet.oldInventorySentOutSilverValue || 0,
    );
    currentRow += 2;

    worksheet.getCell(`A${currentRow}`).value =
      'Received Back from Karigar/Refiner:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Gold Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = Number(
      dailySheet.oldInventoryReceivedGoldWeight || 0,
    );
    worksheet.getCell(`C${currentRow}`).value = 'Gold Value:';
    worksheet.getCell(`D${currentRow}`).value = Number(
      dailySheet.oldInventoryReceivedGoldValue || 0,
    );
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Silver Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = Number(
      dailySheet.oldInventoryReceivedSilverWeight || 0,
    );
    worksheet.getCell(`C${currentRow}`).value = 'Silver Value:';
    worksheet.getCell(`D${currentRow}`).value = Number(
      dailySheet.oldInventoryReceivedSilverValue || 0,
    );
    currentRow += 2;

    // Closing Balance Section
    worksheet.getCell(`A${currentRow}`).value = 'Closing Balance';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    const closingGoldWeight = dailySheet.closingBalanceAutoCalculated
      ? Number(dailySheet.closingGoldWeight)
      : Number(dailySheet.closingGoldWeightManual || 0);
    const closingGoldValue = dailySheet.closingBalanceAutoCalculated
      ? Number(dailySheet.closingGoldValue)
      : Number(dailySheet.closingGoldValueManual || 0);
    const closingSilverWeight = dailySheet.closingBalanceAutoCalculated
      ? Number(dailySheet.closingSilverWeight)
      : Number(dailySheet.closingSilverWeightManual || 0);
    const closingSilverValue = dailySheet.closingBalanceAutoCalculated
      ? Number(dailySheet.closingSilverValue)
      : Number(dailySheet.closingSilverValueManual || 0);
    const closingCash = dailySheet.closingBalanceAutoCalculated
      ? Number(dailySheet.closingCash)
      : Number(dailySheet.closingCashManual || 0);
    const closingOnline = dailySheet.closingBalanceAutoCalculated
      ? Number(dailySheet.closingOnline)
      : Number(dailySheet.closingOnlineManual || 0);

    worksheet.getCell(`A${currentRow}`).value = 'Gold Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = closingGoldWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Gold Value:';
    worksheet.getCell(`D${currentRow}`).value = closingGoldValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Silver Weight (gm):';
    worksheet.getCell(`B${currentRow}`).value = closingSilverWeight;
    worksheet.getCell(`C${currentRow}`).value = 'Silver Value:';
    worksheet.getCell(`D${currentRow}`).value = closingSilverValue;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Cash:';
    worksheet.getCell(`B${currentRow}`).value = closingCash;
    worksheet.getCell(`C${currentRow}`).value = 'Online:';
    worksheet.getCell(`D${currentRow}`).value = closingOnline;

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    // Add notes if present
    if (dailySheet.notes) {
      currentRow += 2;
      worksheet.getCell(`A${currentRow}`).value = 'Notes:';
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = dailySheet.notes;
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
    }

    return workbook;
  }
}
