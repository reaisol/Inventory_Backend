import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettings } from '@app/database';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSettings)
    private readonly settingsRepository: Repository<SystemSettings>,
  ) {}

  async create(createSettingDto: CreateSettingDto): Promise<SystemSettings> {
    const existing = await this.settingsRepository.findOne({
      where: { key: createSettingDto.key },
    });

    if (existing) {
      throw new ConflictException(
        `Setting with key ${createSettingDto.key} already exists`,
      );
    }

    const setting = this.settingsRepository.create(createSettingDto);
    return this.settingsRepository.save(setting);
  }

  async findAll(): Promise<SystemSettings[]> {
    return this.settingsRepository.find({
      order: { key: 'ASC' },
    });
  }

  async findOne(id: number): Promise<SystemSettings> {
    const setting = await this.settingsRepository.findOne({
      where: { id },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with ID ${id} not found`);
    }

    return setting;
  }

  async findByKey(key: string): Promise<SystemSettings> {
    const setting = await this.settingsRepository.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    return setting;
  }

  async update(
    id: number,
    updateSettingDto: UpdateSettingDto,
  ): Promise<SystemSettings> {
    const setting = await this.findOne(id);
    Object.assign(setting, updateSettingDto);
    return this.settingsRepository.save(setting);
  }

  async updateByKey(key: string, value: string): Promise<SystemSettings> {
    const setting = await this.findByKey(key);
    setting.value = value;
    return this.settingsRepository.save(setting);
  }

  async remove(id: number): Promise<void> {
    const setting = await this.findOne(id);
    await this.settingsRepository.remove(setting);
  }
}
