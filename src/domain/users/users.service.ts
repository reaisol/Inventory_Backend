import { AuthenticationService } from '@app/authentication';
import { User } from '@app/database/entities/user.entity';
import { Role } from '@app/database/entities/role.entity';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import {
  PaginatedResponse,
  createPaginationMeta,
} from '../../shared/interfaces/pagination-response.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly authService: AuthenticationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, roleIds } = createUserDto;

    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException(`User with email ${email} already exists`);
    }

    // Find roles if provided
    let roles = [];
    if (roleIds && roleIds.length > 0) {
      roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
      });
      if (roles.length !== roleIds.length) {
        throw new NotFoundException('One or more roles not found');
      }
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(password);

    // Create new user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles,
    });

    return this.userRepository.save(user);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<User>> {
    const { page, limit, sortBy, sortOrder, search } = paginationQuery;
    const skip = (page - 1) * limit;

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles');

    // Apply search filter if provided
    if (search) {
      query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    // Apply sorting if provided
    if (sortBy) {
      const sortField = sortBy.includes('.') ? sortBy : `user.${sortBy}`;
      query.orderBy(sortField, sortOrder);
    } else {
      // Default sorting
      query.orderBy('user.createdAt', 'DESC');
    }

    // Get total count for pagination
    const totalItems = await query.getCount();

    // Apply pagination
    query.skip(skip).take(limit);

    // Get paginated data
    const data = await query.getMany();

    // Create pagination metadata
    const meta = createPaginationMeta(page, limit, totalItems);

    return {
      data,
      meta,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Update roles if provided
    if (updateUserDto.roleIds && updateUserDto.roleIds.length > 0) {
      const roles = await this.roleRepository.find({
        where: { id: In(updateUserDto.roleIds) },
      });

      if (roles.length !== updateUserDto.roleIds.length) {
        throw new NotFoundException('One or more roles not found');
      }

      user.roles = roles;
    }

    // Update password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await this.authService.hashPassword(
        updateUserDto.password,
      );
    }

    // Update other fields
    Object.assign(user, {
      name: updateUserDto.name !== undefined ? updateUserDto.name : user.name,
      email:
        updateUserDto.email !== undefined ? updateUserDto.email : user.email,
      password:
        updateUserDto.password !== undefined
          ? updateUserDto.password
          : user.password,
    });

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<User> {
    const user = await this.findOne(userId);
    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Check if user already has this role
    const hasRole = user.roles?.some((r) => r.id === roleId);
    if (hasRole) {
      throw new BadRequestException(`User already has role ${role.name}`);
    }

    // Add role to user
    if (!user.roles) {
      user.roles = [];
    }
    user.roles.push(role);

    return this.userRepository.save(user);
  }
}
