import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
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

    // Get default wastage and making charges from settings if not provided
    let wastagePercentage = createProductDto.wastagePercentage;
    let makingChargesPercentage = createProductDto.makingChargesPercentage;

    if (!wastagePercentage) {
      const wastageSetting = await this.settingsRepository.findOne({
        where: { key: 'DEFAULT_WASTAGE_PERCENTAGE' },
      });
      wastagePercentage = wastageSetting
        ? parseFloat(wastageSetting.value)
        : 5.0;
    }

    if (!makingChargesPercentage) {
      const makingChargesSetting = await this.settingsRepository.findOne({
        where: { key: 'DEFAULT_MAKING_CHARGES_PERCENTAGE' },
      });
      makingChargesPercentage = makingChargesSetting
        ? parseFloat(makingChargesSetting.value)
        : 15.0;
    }

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

    // Create product
    const product = this.productRepository.create({
      ...createProductDto,
      productId,
      wastagePercentage,
      makingChargesPercentage,
      status: ProductStatus.IN_STOCK,
    });

    return this.productRepository.save(product);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
    filters?: {
      metalTypeId?: number;
      categoryId?: number;
      status?: ProductStatus;
    },
  ): Promise<PaginatedResponse<Product>> {
    const { page, limit, sortBy, sortOrder, search } = paginationQuery;
    const skip = (page - 1) * limit;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.metalType', 'metalType')
      .leftJoinAndSelect('product.metalPurity', 'metalPurity')
      .leftJoinAndSelect('product.category', 'category');

    // Apply filters
    if (filters?.metalTypeId) {
      query.andWhere('product.metalTypeId = :metalTypeId', {
        metalTypeId: filters.metalTypeId,
      });
    }

    if (filters?.categoryId) {
      query.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters?.status) {
      query.andWhere('product.status = :status', { status: filters.status });
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
    await this.updateLowStockStatus();

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
