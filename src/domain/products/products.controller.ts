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
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { PriceCalculationResponseDto } from './dto/price-calculation-response.dto';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import {
  JwtAuthGuard,
  PoliciesGuard,
  CheckPolicies,
} from '@app/authentication';
import { ProductStatus } from '@app/database';
import { plainToClass } from 'class-transformer';
import {
  CreateProductPolicyHandler,
  ReadProductPolicyHandler,
  UpdateProductPolicyHandler,
  DeleteProductPolicyHandler,
} from './handlers/product-policy.handler';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 404,
    description: 'Metal type, purity, or category not found',
  })
  @CheckPolicies(new CreateProductPolicyHandler())
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    return plainToClass(ProductResponseDto, product);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'metalTypeId', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'List of products retrieved successfully',
  })
  @CheckPolicies(new ReadProductPolicyHandler())
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('metalTypeId', ParseIntPipe) metalTypeId?: number,
    @Query('categoryId', ParseIntPipe) categoryId?: number,
    @Query('status') status?: ProductStatus,
  ) {
    const result = await this.productsService.findAll(paginationQuery, {
      metalTypeId,
      categoryId,
      status,
    });
    return {
      data: result.data.map((product) =>
        plainToClass(ProductResponseDto, product),
      ),
      meta: result.meta,
    };
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Get product by barcode' })
  @ApiParam({ name: 'barcode', type: String })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @CheckPolicies(new ReadProductPolicyHandler())
  async findByBarcode(@Param('barcode') barcode: string) {
    const product = await this.productsService.findByBarcode(barcode);
    return plainToClass(ProductResponseDto, product);
  }

  @Get('product-id/:productId')
  @ApiOperation({ summary: 'Get product by product ID' })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @CheckPolicies(new ReadProductPolicyHandler())
  async findByProductId(@Param('productId') productId: string) {
    const product = await this.productsService.findByProductId(productId);
    return plainToClass(ProductResponseDto, product);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @CheckPolicies(new ReadProductPolicyHandler())
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productsService.findOne(id);
    return plainToClass(ProductResponseDto, product);
  }

  @Get(':id/price')
  @ApiOperation({
    summary: 'Calculate product selling price (for billing)',
    description:
      'Calculates the selling price of a product using current metal prices. This is the same calculation used when creating orders/bills. Returns detailed breakdown including base price, wastage, making charges, stone cost, and total.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Product price calculated successfully',
    type: PriceCalculationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product or metal price not found' })
  @CheckPolicies(new ReadProductPolicyHandler())
  async calculatePrice(@Param('id', ParseIntPipe) id: number) {
    const priceCalculation = await this.productsService.calculatePrice(id);
    return plainToClass(PriceCalculationResponseDto, priceCalculation);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @CheckPolicies(new UpdateProductPolicyHandler())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateProductDto);
    return plainToClass(ProductResponseDto, product);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @CheckPolicies(new DeleteProductPolicyHandler())
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.remove(id);
    return { message: 'Product deleted successfully' };
  }
}
