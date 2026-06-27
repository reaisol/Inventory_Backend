import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Product,
  MetalType,
  MetalPurity,
  Category,
  ProductStatus,
  SystemSettings,
} from '@app/database';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  PaginatedResponse,
  createPaginationMeta,
} from '../../shared/interfaces/pagination-response.interface';
import {
  generateProductId,
  getNextProductSequence,
} from '../../utils/product-id-generator';
import { calculateProductPrice } from '../../utils/price-calculator';
import { MetalsService } from '../metals/metals.service';
import { ProductQueryPaginationDto } from './dto/product-query-pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MetalType)
    private readonly metalTypeRepository: Repository<MetalType>,
    @InjectRepository(MetalPurity)
    private readonly metalPurityRepository: Repository<MetalPurity>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SystemSettings)
    private readonly settingsRepository: Repository<SystemSettings>,
    private readonly metalsService: MetalsService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Validate metal type
    const metalType = await this.metalTypeRepository.findOne({
      where: { id: createProductDto.metalTypeId },
    });
    if (!metalType) {
      throw new NotFoundException(
        `Metal type with ID ${createProductDto.metalTypeId} not found`,
      );
    }

    // Validate metal purity
    const metalPurity = await this.metalPurityRepository.findOne({
      where: {
        id: createProductDto.metalPurityId,
        metalTypeId: createProductDto.metalTypeId,
      },
    });
    if (!metalPurity) {
      throw new NotFoundException(
        `Metal purity with ID ${createProductDto.metalPurityId} not found for metal type ${createProductDto.metalTypeId}`,
      );
    }

    // Validate category
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createProductDto.categoryId} not found`,
      );
    }

    // Check barcode uniqueness if provided
    if (createProductDto.barcode) {
      const existing = await this.productRepository.findOne({
        where: { barcode: createProductDto.barcode },
      });
      if (existing) {
        throw new BadRequestException(
          `Product with barcode ${createProductDto.barcode} already exists`,
        );
      }
    }

    // Default wastage and making charges to 0 if not provided
    const wastagePercentage = createProductDto.wastagePercentage !== undefined && createProductDto.wastagePercentage !== null
      ? createProductDto.wastagePercentage
      : 0.0;

    const makingChargesAmount = createProductDto.makingChargesAmount !== undefined && createProductDto.makingChargesAmount !== null
      ? createProductDto.makingChargesAmount
      : 0;

    // Generate product ID
    const sequence = await getNextProductSequence(
      this.productRepository,
      metalType.code,
      category.code,
    );
    const productId = await generateProductId(
      metalType,
      category,
      new Date().getFullYear(),
      sequence,
    );

    // Validate bulk item fields
    if (createProductDto.isBulkItem) {
      if (
        !createProductDto.totalQuantity ||
        createProductDto.totalQuantity < 1
      ) {
        throw new BadRequestException(
          'totalQuantity is required and must be at least 1 for bulk items',
        );
      }
    }

    // Create product
    const product = this.productRepository.create({
      ...createProductDto,
      productId,
      wastagePercentage,
      makingChargesAmount,
      status: ProductStatus.IN_STOCK,
      isBulkItem: createProductDto.isBulkItem || false,
    });

    // Calculate bulk item fields
    if (product.isBulkItem && product.totalQuantity) {
      product.remainingQuantity = product.totalQuantity;
      product.weightPerItem = Number(
        (product.grossWeightGm / product.totalQuantity).toFixed(3),
      );
    }

    return this.productRepository.save(product);
  }

  async findAll(
    paginationQuery: ProductQueryPaginationDto,
  ): Promise<PaginatedResponse<Product>> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      metalTypeId,
      categoryId,
      status,
    } = paginationQuery;
    const skip = (page - 1) * limit;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.metalType', 'metalType')
      .leftJoinAndSelect('product.metalPurity', 'metalPurity')
      .leftJoinAndSelect('product.category', 'category');

    // Apply filters
    if (metalTypeId) {
      query.andWhere('product.metalTypeId = :metalTypeId', {
        metalTypeId: metalTypeId,
      });
    }

    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', {
        categoryId: categoryId,
      });
    }

    if (status) {
      query.andWhere('product.status = :status', { status: status });
    }

    // Apply search
    if (search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.productId ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    if (sortBy) {
      const sortField = sortBy.includes('.') ? sortBy : `product.${sortBy}`;
      query.orderBy(sortField, sortOrder);
    } else {
      query.orderBy('product.createdAt', 'DESC');
    }

    // Get total count
    const totalItems = await query.getCount();

    // Apply pagination
    query.skip(skip).take(limit);

    // Get data
    const data = await query.getMany();

    // Check and update low stock status
    // await this.updateLowStockStatus();

    const meta = createPaginationMeta(page, limit, totalItems);

    return { data, meta };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['metalType', 'metalPurity', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByProductId(productId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { productId },
      relations: ['metalType', 'metalPurity', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product;
  }

  async findByBarcode(barcode: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { barcode },
      relations: ['metalType', 'metalPurity', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    // Check barcode uniqueness if updating
    if (
      updateProductDto.barcode &&
      updateProductDto.barcode !== product.barcode
    ) {
      const existing = await this.productRepository.findOne({
        where: { barcode: updateProductDto.barcode },
      });
      if (existing) {
        throw new BadRequestException(
          `Product with barcode ${updateProductDto.barcode} already exists`,
        );
      }
    }

    // Handle bulk item updates
    if (updateProductDto.isBulkItem !== undefined) {
      // Only allow changing isBulkItem if product hasn't been sold
      if (product.status === ProductStatus.SOLD) {
        throw new BadRequestException(
          'Cannot change isBulkItem for sold products',
        );
      }
      product.isBulkItem = updateProductDto.isBulkItem;
    }

    if (updateProductDto.totalQuantity !== undefined) {
      // Only allow updating totalQuantity if product hasn't been sold yet
      if (product.status === ProductStatus.SOLD) {
        throw new BadRequestException(
          'Cannot update totalQuantity for sold products',
        );
      }
      const oldTotalQuantity = product.totalQuantity || 0;
      product.totalQuantity = updateProductDto.totalQuantity;

      // If increasing totalQuantity, adjust remainingQuantity proportionally
      if (oldTotalQuantity > 0 && product.remainingQuantity !== null) {
        const ratio = updateProductDto.totalQuantity / oldTotalQuantity;
        product.remainingQuantity = Math.floor(
          (product.remainingQuantity || 0) * ratio,
        );
      } else {
        // If setting totalQuantity for first time, set remainingQuantity
        product.remainingQuantity = updateProductDto.totalQuantity;
      }
    }

    // Recalculate bulk item fields if weight or totalQuantity changed
    if (
      product.isBulkItem &&
      product.totalQuantity &&
      (updateProductDto.grossWeightGm !== undefined ||
        updateProductDto.totalQuantity !== undefined)
    ) {
      // Recalculate weight per item
      product.weightPerItem = Number(
        (product.grossWeightGm / product.totalQuantity).toFixed(3),
      );
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  /**
   * Update low stock status for products
   * Checks if products should be marked as LOW_STOCK based on threshold
   */
  async updateLowStockStatus(): Promise<void> {
    const thresholdSetting = await this.settingsRepository.findOne({
      where: { key: 'LOW_STOCK_THRESHOLD' },
    });
    const threshold = thresholdSetting ? parseInt(thresholdSetting.value) : 2;

    // Get count of in-stock products by category
    const categories = await this.categoryRepository.find();

    for (const category of categories) {
      const inStockCount = await this.productRepository.count({
        where: {
          categoryId: category.id,
          status: ProductStatus.IN_STOCK,
        },
      });

      if (inStockCount <= threshold) {
        // Mark products as low stock
        await this.productRepository.update(
          {
            categoryId: category.id,
            status: ProductStatus.IN_STOCK,
          },
          { status: ProductStatus.LOW_STOCK },
        );
      } else {
        // Mark low stock products back to in stock if count is above threshold
        await this.productRepository.update(
          {
            categoryId: category.id,
            status: ProductStatus.LOW_STOCK,
          },
          { status: ProductStatus.IN_STOCK },
        );
      }
    }
  }

  /**
   * Calculate the selling price for a product
   * This is the same calculation used for billing in orders
   * Returns detailed breakdown: base price, wastage, making charges, stone cost, and total
   */
  async calculatePrice(productId: number): Promise<{
    basePrice: number;
    wastageAmount: number;
    makingChargesAmount: number;
    stoneCost: number;
    totalPrice: number;
    pricePerGram: number;
    effectiveDate: Date;
  }> {
    const product = await this.findOne(productId);
    // if product sold, throw error
    if (product.status === ProductStatus.SOLD) {
      throw new BadRequestException('Product is already sold');
    }
    // Get current metal price for the product's metal purity
    const metalPrice = await this.metalsService.getCurrentMetalPrice(
      product.metalPurityId,
    );

    // Calculate product price using the same utility as orders
    const priceCalculation = calculateProductPrice(product, metalPrice);

    return {
      ...priceCalculation,
      pricePerGram: metalPrice.pricePerGram,
      effectiveDate: metalPrice.effectiveDate,
    };
  }
}
