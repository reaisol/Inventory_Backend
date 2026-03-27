import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  ParseIntPipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToClass } from 'class-transformer';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import { MessageResponseDto } from '../../shared/dto/pagination-response.dto';
import {
  JwtAuthGuard,
  PoliciesGuard,
  CheckPolicies,
} from '@app/authentication';
import {
  CreateUserPolicyHandler,
  ReadUserPolicyHandler,
  UpdateUserPolicyHandler,
  DeleteUserPolicyHandler,
  AssignRolePolicyHandler,
} from './handlers/user-policy.handler';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @CheckPolicies(new CreateUserPolicyHandler())
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return plainToClass(UserResponseDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserResponseDto' },
        },
        meta: { $ref: '#/components/schemas/PaginationMetaDto' },
      },
    },
  })
  @CheckPolicies(new ReadUserPolicyHandler())
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    const result = await this.usersService.findAll(paginationQuery);
    return {
      data: result.data.map((user) => plainToClass(UserResponseDto, user)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @CheckPolicies(new ReadUserPolicyHandler())
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return plainToClass(UserResponseDto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @CheckPolicies(new UpdateUserPolicyHandler())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return plainToClass(UserResponseDto, user);
  }

  @Post(':id/assign-role')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'User already has this role' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @CheckPolicies(new AssignRolePolicyHandler())
  async assignRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    const user = await this.usersService.assignRoleToUser(
      userId,
      assignRoleDto.roleId,
    );
    return plainToClass(UserResponseDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @CheckPolicies(new DeleteUserPolicyHandler())
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    if (req.user && req.user.id === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
