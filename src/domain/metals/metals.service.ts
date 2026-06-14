import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { MetalType, MetalPurity, MetalPrice, Product } from '@app/database';
import { CreateMetalPriceDto } from './dto/create-metal-price.dto';

@Injectable()
export class MetalsService {
  constructor(
    @InjectRepository(MetalType)
    private readonly metalTypeRepository: Repository<MetalType>,
    @InjectRepository(MetalPurity)
    private readonly metalPurityRepository: Repository<MetalPurity>,
    @InjectRepository(MetalPrice)
    private readonly metalPriceRepository: Repository<MetalPrice>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAllMetalTypes(): Promise<MetalType[]> {
    return this.metalTypeRepository.find({
      relations: ['purities'],
      order: { name: 'ASC' },
    });
  }

  async findAllMetalPurities(metalTypeId?: number): Promise<MetalPurity[]> {
    const query = this.metalPurityRepository
      .createQueryBuilder('purity')
      .leftJoinAndSelect('purity.metalType', 'metalType')
      .orderBy('purity.purityPercentage', 'DESC');

    if (metalTypeId) {
      query.where('purity.metalTypeId = :metalTypeId', { metalTypeId });
    }

    return query.getMany();
  }

  async getCurrentMetalPrice(
    metalPurityId: number,
    date?: Date,
  ): Promise<MetalPrice> {
    const effectiveDate = date || new Date();

    const price = await this.metalPriceRepository.findOne({
      where: {
        metalPurityId,
        isActive: true,
        effectiveDate: LessThanOrEqual(effectiveDate),
      },
      relations: ['metalPurity', 'metalPurity.metalType'],
      order: { effectiveDate: 'DESC' },
    });

    if (!price) {
      throw new NotFoundException(
        `No active price found for metal purity ID ${metalPurityId}`,
      );
    }

    return price;
  }

  async createMetalPurity(data: {
    metalTypeId: number;
    name: string;
    code: string;
    purityPercentage: number;
  }): Promise<MetalPurity> {
    const existing = await this.metalPurityRepository.findOne({
      where: { metalTypeId: data.metalTypeId, code: data.code },
    });

    if (existing) {
      throw new ConflictException(
        `Metal purity with code ${data.code} already exists for this metal type.`,
      );
    }

    const newPurity = this.metalPurityRepository.create(data);
    return this.metalPurityRepository.save(newPurity);
  }

  async deleteMetalPurity(id: number): Promise<void> {
    const purity = await this.metalPurityRepository.findOne({ where: { id } });
    if (!purity) {
      throw new NotFoundException(`Metal purity with ID ${id} not found`);
    }

    const productCount = await this.productRepository.count({
      where: { metalPurityId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete this purity. ${productCount} product(s) are using it. Please reassign or delete those products first.`,
      );
    }

    // Delete associated prices first to satisfy any foreign key constraints
    await this.metalPriceRepository.delete({ metalPurityId: id });
    await this.metalPurityRepository.delete(id);
  }

  async createMetalPrice(
    createMetalPriceDto: CreateMetalPriceDto,
  ): Promise<MetalPrice> {
    // Verify metal purity exists
    const metalPurity = await this.metalPurityRepository.findOne({
      where: { id: createMetalPriceDto.metalPurityId },
    });

    if (!metalPurity) {
      throw new NotFoundException(
        `Metal purity with ID ${createMetalPriceDto.metalPurityId} not found`,
      );
    }

    // Deactivate previous prices for the same metal purity if this is set as active
    if (createMetalPriceDto.isActive !== false) {
      await this.metalPriceRepository.update(
        {
          metalPurityId: createMetalPriceDto.metalPurityId,
          isActive: true,
        },
        { isActive: false },
      );
    }

    const metalPrice = this.metalPriceRepository.create({
      ...createMetalPriceDto,
      effectiveDate: new Date(createMetalPriceDto.effectiveDate),
    });

    return this.metalPriceRepository.save(metalPrice);
  }

  async getMetalPriceHistory(
    metalPurityId: number,
    limit: number = 30,
  ): Promise<MetalPrice[]> {
    return this.metalPriceRepository.find({
      where: { metalPurityId },
      relations: ['metalPurity'],
      order: { effectiveDate: 'DESC' },
      take: limit,
    });
  }
}
