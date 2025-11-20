import { Role } from '@app/database/entities/role.entity';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationQueryDto } from '../../shared/dto/pagination-query.dto';
import {
  PaginatedResponse,
  createPaginationMeta,
} from '../../shared/interfaces/pagination-response.interface';
import { PERMISSIONS } from '@app/authentication/permissions';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role with the same name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException(
        `Role with name ${createRoleDto.name} already exists`,
      );
    }

    // Validate permissions if provided
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      const invalidPermissions = createRoleDto.permissions.filter(
        (perm) => !PERMISSIONS[perm],
      );
      if (invalidPermissions.length > 0) {
        throw new ConflictException(
          `Invalid permissions: ${invalidPermissions.join(', ')}`,
        );
      }
    }

    return this.roleRepository.save(createRoleDto);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Role>> {
    const { page, limit, sortBy, sortOrder, search } = paginationQuery;
    const skip = (page - 1) * limit;

    const query = this.roleRepository.createQueryBuilder('role');

    // Apply search filter if provided
    if (search) {
      query.where('role.name ILIKE :search', { search: `%${search}%` });
    }

    // Apply sorting if provided
    if (sortBy) {
      const sortField = `role.${sortBy}`;
      query.orderBy(sortField, sortOrder);
    } else {
      // Default sorting
      query.orderBy('role.name', 'ASC');
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

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Check if updating name and if it already exists
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException(
          `Role with name ${updateRoleDto.name} already exists`,
        );
      }

      role.name = updateRoleDto.name;
    }

    // Update permissions if provided
    if (updateRoleDto.permissions !== undefined) {
      // Validate permissions
      if (updateRoleDto.permissions.length > 0) {
        const invalidPermissions = updateRoleDto.permissions.filter(
          (perm) => !PERMISSIONS[perm],
        );
        if (invalidPermissions.length > 0) {
          throw new ConflictException(
            `Invalid permissions: ${invalidPermissions.join(', ')}`,
          );
        }
      }
      role.permissions = updateRoleDto.permissions;
    }

    return this.roleRepository.save(role);
  }

  async addPermissionsToExistingRole(
    id: number,
    permissions: string[],
  ): Promise<Role> {
    const role = await this.findOne(id);

    // Validate permissions
    if (permissions.length > 0) {
      const invalidPermissions = permissions.filter(
        (perm) => !PERMISSIONS[perm],
      );
      if (invalidPermissions.length > 0) {
        throw new ConflictException(
          `Invalid permissions: ${invalidPermissions.join(', ')}`,
        );
      }
    }

    // Merge with existing permissions, avoiding duplicates
    const existingPermissions = role.permissions || [];
    const mergedPermissions = [
      ...new Set([...existingPermissions, ...permissions]),
    ];
    role.permissions = mergedPermissions;

    return this.roleRepository.save(role);
  }

  async listPermissions(): Promise<{ permissions: Record<string, any> }> {
    return { permissions: PERMISSIONS };
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
}
