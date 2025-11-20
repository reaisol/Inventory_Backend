import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingResponseDto } from './dto/setting-response.dto';
import {
  JwtAuthGuard,
  PoliciesGuard,
  CheckPolicies,
} from '@app/authentication';
import { plainToClass } from 'class-transformer';
import {
  CreateSettingPolicyHandler,
  ReadSettingPolicyHandler,
  UpdateSettingPolicyHandler,
  DeleteSettingPolicyHandler,
} from './handlers/setting-policy.handler';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new system setting' })
  @ApiResponse({
    status: 201,
    description: 'Setting created successfully',
    type: SettingResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Setting key already exists' })
  @CheckPolicies(new CreateSettingPolicyHandler())
  async create(@Body() createSettingDto: CreateSettingDto) {
    const setting = await this.settingsService.create(createSettingDto);
    return plainToClass(SettingResponseDto, setting);
  }

  @Get()
  @ApiOperation({ summary: 'Get all system settings' })
  @ApiResponse({
    status: 200,
    description: 'List of settings retrieved successfully',
    type: [SettingResponseDto],
  })
  @CheckPolicies(new ReadSettingPolicyHandler())
  async findAll() {
    const settings = await this.settingsService.findAll();
    return settings.map((setting) => plainToClass(SettingResponseDto, setting));
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get setting by key' })
  @ApiParam({ name: 'key', type: String })
  @ApiResponse({
    status: 200,
    description: 'Setting retrieved successfully',
    type: SettingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @CheckPolicies(new ReadSettingPolicyHandler())
  async findByKey(@Param('key') key: string) {
    const setting = await this.settingsService.findByKey(key);
    return plainToClass(SettingResponseDto, setting);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a setting by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Setting retrieved successfully',
    type: SettingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @CheckPolicies(new ReadSettingPolicyHandler())
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const setting = await this.settingsService.findOne(id);
    return plainToClass(SettingResponseDto, setting);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a setting' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Setting updated successfully',
    type: SettingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @CheckPolicies(new UpdateSettingPolicyHandler())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    const setting = await this.settingsService.update(id, updateSettingDto);
    return plainToClass(SettingResponseDto, setting);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a setting' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Setting deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @CheckPolicies(new DeleteSettingPolicyHandler())
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.settingsService.remove(id);
    return { message: 'Setting deleted successfully' };
  }
}
