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
import { MetalsService } from './metals.service';
import { CreateMetalPriceDto } from './dto/create-metal-price.dto';
import { MetalPriceResponseDto } from './dto/metal-price-response.dto';
import {
  JwtAuthGuard,
  PoliciesGuard,
  CheckPolicies,
} from '@app/authentication';
import { plainToClass } from 'class-transformer';
import {
  ReadMetalPolicyHandler,
  CreateMetalPricePolicyHandler,
  DeleteMetalPricePolicyHandler,
} from './handlers/metal-policy.handler';
import { Delete } from '@nestjs/common';
@ApiTags('Metals')
@Controller('metals')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class MetalsController {
  constructor(private readonly metalsService: MetalsService) {}

  @Get('types')
  @ApiOperation({ summary: 'Get all metal types' })
  @ApiResponse({
    status: 200,
    description: 'List of metal types retrieved successfully',
  })
  @CheckPolicies(new ReadMetalPolicyHandler())
  async findAllMetalTypes() {
    return this.metalsService.findAllMetalTypes();
  }

  @Get('purities')
  @ApiOperation({ summary: 'Get all metal purities' })
  @ApiQuery({
    name: 'metalTypeId',
    required: false,
    type: Number,
    description: 'Filter by metal type ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of metal purities retrieved successfully',
  })
  @CheckPolicies(new ReadMetalPolicyHandler())
  async findAllMetalPurities(
    @Query('metalTypeId', ParseIntPipe) metalTypeId?: number,
  ) {
    return this.metalsService.findAllMetalPurities(metalTypeId);
  }

  @Post('purities')
  @ApiOperation({ summary: 'Create a new metal purity' })
  @CheckPolicies(new CreateMetalPricePolicyHandler())
  async createMetalPurity(
    @Body() body: { metalTypeId: number; name: string; code: string; purityPercentage: number; }
  ) {
    return this.metalsService.createMetalPurity(body);
  }

  @Delete('purities/:id')
  @ApiOperation({ summary: 'Delete a metal purity' })
  @CheckPolicies(new DeleteMetalPricePolicyHandler())
  async deleteMetalPurity(@Param('id', ParseIntPipe) id: number) {
    await this.metalsService.deleteMetalPurity(id);
    return { message: 'Metal purity deleted successfully' };
  }

  @Get('purities/:id/price')
  @ApiOperation({ summary: 'Get current price for a metal purity' })
  @ApiParam({ name: 'id', type: Number, description: 'Metal Purity ID' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Date to get price for (YYYY-MM-DD). Defaults to today',
  })
  @ApiResponse({
    status: 200,
    description: 'Current metal price retrieved successfully',
    type: MetalPriceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Price not found' })
  @CheckPolicies(new ReadMetalPolicyHandler())
  async getCurrentMetalPrice(
    @Param('id', ParseIntPipe) metalPurityId: number,
    @Query('date') date?: string,
  ) {
    const effectiveDate = date ? new Date(date) : undefined;
    const price = await this.metalsService.getCurrentMetalPrice(
      metalPurityId,
      effectiveDate,
    );
    return plainToClass(MetalPriceResponseDto, price);
  }

  @Get('purities/:id/prices')
  @ApiOperation({ summary: 'Get price history for a metal purity' })
  @ApiParam({ name: 'id', type: Number, description: 'Metal Purity ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records to return (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Price history retrieved successfully',
    type: [MetalPriceResponseDto],
  })
  @CheckPolicies(new ReadMetalPolicyHandler())
  async getMetalPriceHistory(
    @Param('id', ParseIntPipe) metalPurityId: number,
    @Query('limit', ParseIntPipe) limit: number = 30,
  ) {
    const prices = await this.metalsService.getMetalPriceHistory(
      metalPurityId,
      limit,
    );
    return prices.map((price) => plainToClass(MetalPriceResponseDto, price));
  }

  @Post('prices')
  @ApiOperation({ summary: 'Create a new metal price' })
  @ApiResponse({
    status: 201,
    description: 'Metal price created successfully',
    type: MetalPriceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Metal purity not found' })
  @CheckPolicies(new CreateMetalPricePolicyHandler())
  async createMetalPrice(@Body() createMetalPriceDto: CreateMetalPriceDto) {
    const price =
      await this.metalsService.createMetalPrice(createMetalPriceDto);
    return plainToClass(MetalPriceResponseDto, price);
  }
}
