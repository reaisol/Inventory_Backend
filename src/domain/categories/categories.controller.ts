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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  JwtAuthGuard,
  PoliciesGuard,
  CheckPolicies,
} from '@app/authentication';
import { plainToClass } from 'class-transformer';
import {
  CreateCategoryPolicyHandler,
  ReadCategoryPolicyHandler,
  UpdateCategoryPolicyHandler,
  DeleteCategoryPolicyHandler,
} from './handlers/category-policy.handler';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Category code already exists' })
  @CheckPolicies(new CreateCategoryPolicyHandler())
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return plainToClass(CategoryResponseDto, category);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  @CheckPolicies(new ReadCategoryPolicyHandler())
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return categories.map((category) =>
      plainToClass(CategoryResponseDto, category),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @CheckPolicies(new ReadCategoryPolicyHandler())
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoriesService.findOne(id);
    return plainToClass(CategoryResponseDto, category);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @CheckPolicies(new UpdateCategoryPolicyHandler())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return plainToClass(CategoryResponseDto, category);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @CheckPolicies(new DeleteCategoryPolicyHandler())
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.remove(id);
    return { message: 'Category deleted successfully' };
  }
}
