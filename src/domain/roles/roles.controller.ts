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
  Query,
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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AddPermissionsDto } from './dto/add-permissions.dto';
import { PermissionsResponseDto } from './dto/permissions-response.dto';
import { MessageResponseDto } from '../../shared/dto/pagination-response.dto';
import {
  JwtAuthGuard,
  PoliciesGuard,
  CheckPolicies,
} from '@app/authentication';
import { RoleResponseDto } from './dto/role-response.dto';
import { plainToClass } from 'class-transformer';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import {
  CreateRolePolicyHandler,
  ReadRolePolicyHandler,
  UpdateRolePolicyHandler,
  DeleteRolePolicyHandler,
  ListPermissionsPolicyHandler,
} from './handlers/role-policy.handler';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  @CheckPolicies(new CreateRolePolicyHandler())
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);
    return plainToClass(RoleResponseDto, role);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all available permissions' })
  @ApiResponse({
    status: 200,
    description: 'List of permissions retrieved successfully',
    type: PermissionsResponseDto,
  })
  @CheckPolicies(new ListPermissionsPolicyHandler())
  async listPermissions() {
    return this.rolesService.listPermissions();
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @CheckPolicies(new ReadRolePolicyHandler())
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    const result = await this.rolesService.findAll(paginationQuery);
    return {
      data: result.data.map((role) => plainToClass(RoleResponseDto, role)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @CheckPolicies(new ReadRolePolicyHandler())
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const role = await this.rolesService.findOne(id);
    return plainToClass(RoleResponseDto, role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  @CheckPolicies(new UpdateRolePolicyHandler())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(id, updateRoleDto);
    return plainToClass(RoleResponseDto, role);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Add permissions to an existing role' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Permissions added successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Invalid permissions' })
  @CheckPolicies(new UpdateRolePolicyHandler())
  async addPermissionsToExistingRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() addPermissionsDto: AddPermissionsDto,
  ) {
    const role = await this.rolesService.addPermissionsToExistingRole(
      id,
      addPermissionsDto.permissions,
    );
    return plainToClass(RoleResponseDto, role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @CheckPolicies(new DeleteRolePolicyHandler())
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.rolesService.remove(id);
    return { message: 'Role deleted successfully' };
  }
}
