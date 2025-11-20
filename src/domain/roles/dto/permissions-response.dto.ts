import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty({ description: 'Permission action', example: 'create' })
  action: string;

  @ApiProperty({ description: 'Permission resource', example: 'users' })
  resource: string;
}

export class PermissionsResponseDto {
  @ApiProperty({
    description: 'Map of available permissions',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        action: { type: 'string' },
        resource: { type: 'string' },
      },
    },
    example: {
      create_user: { action: 'create', resource: 'users' },
      read_user: { action: 'read', resource: 'users' },
    },
  })
  permissions: Record<string, PermissionDto>;
}
