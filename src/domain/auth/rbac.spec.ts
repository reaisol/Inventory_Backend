import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CaslAbilityFactory } from '../../../libs/authentication/src/factories/casl-ability.factory';
import { PoliciesGuard } from '../../../libs/authentication/src/guards/policies.guard';
import { PERMISSIONS } from '../../../libs/authentication/src/permissions';

import { ReadDashboardPolicyHandler } from '../dashboard/handlers/dashboard-policy.handler';
import { ReadOrderPolicyHandler, CreateOrderPolicyHandler } from '../orders/handlers/order-policy.handler';
import { ReadCustomerPolicyHandler, CreateCustomerPolicyHandler } from '../customers/handlers/customer-policy.handler';
import { ReadProductPolicyHandler, CreateProductPolicyHandler } from '../products/handlers/product-policy.handler';
import { ReadMetalPolicyHandler } from '../metals/handlers/metal-policy.handler';
import { ReadCategoryPolicyHandler } from '../categories/handlers/category-policy.handler';
import { ReadSettingPolicyHandler } from '../settings/handlers/setting-policy.handler';
import { ReadUserPolicyHandler, DeleteUserPolicyHandler } from '../users/handlers/user-policy.handler';
import { ReadRolePolicyHandler } from '../roles/handlers/role-policy.handler';

describe('RBAC Access Control & Permission Guards', () => {
  let caslAbilityFactory: CaslAbilityFactory;
  let reflector: Reflector;
  let guard: PoliciesGuard;

  // Mock roles repository
  const mockRoles = [
    {
      id: 1,
      name: 'super_admin',
      permissions: Object.keys(PERMISSIONS),
    },
    {
      id: 2,
      name: 'sales_manager',
      permissions: [
        'read_order',
        'create_order',
        'read_customer',
        'create_customer',
        'update_customer',
        'delete_customer',
      ],
    },
    {
      id: 3,
      name: 'inventory_manager',
      permissions: [
        'read_product',
        'create_product',
        'update_product',
        'delete_product',
        'read_metal_price',
        'read_metal_type',
        'read_metal_purity',
        'read_category',
        'create_category',
        'update_category',
        'read_setting',
        'update_setting',
      ],
    },
  ];

  const mockRoleRepo = {
    find: jest.fn().mockImplementation(async ({ where }) => {
      const ids = where?.id?._value || [];
      return mockRoles.filter((r) => ids.includes(r.id));
    }),
  };

  beforeEach(() => {
    caslAbilityFactory = new CaslAbilityFactory(mockRoleRepo as any);
    reflector = new Reflector();
    guard = new PoliciesGuard(reflector, caslAbilityFactory);
  });

  describe('1. Dashboard Access Control', () => {
    it('should GRANT access to Dashboard for Super Admin', async () => {
      const user = { id: 1, email: 'admin@test.com', roles: [1] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      const handler = new ReadDashboardPolicyHandler();
      expect(handler.handle(ability)).toBe(true);
    });

    it('should DENY access to Dashboard for Sales Manager', async () => {
      const user = { id: 2, email: 'sales@test.com', roles: [2] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      const handler = new ReadDashboardPolicyHandler();
      expect(handler.handle(ability)).toBe(false);
    });

    it('should DENY access to Dashboard for Inventory Manager', async () => {
      const user = { id: 3, email: 'inv@test.com', roles: [3] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      const handler = new ReadDashboardPolicyHandler();
      expect(handler.handle(ability)).toBe(false);
    });
  });

  describe('2. Sales Manager Access Rules', () => {
    it('should ALLOW Sales Manager to access Orders / Billing', async () => {
      const user = { id: 2, email: 'sales@test.com', roles: [2] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(new ReadOrderPolicyHandler().handle(ability)).toBe(true);
      expect(new CreateOrderPolicyHandler().handle(ability)).toBe(true);
    });

    it('should ALLOW Sales Manager to access Customers', async () => {
      const user = { id: 2, email: 'sales@test.com', roles: [2] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(new ReadCustomerPolicyHandler().handle(ability)).toBe(true);
      expect(new CreateCustomerPolicyHandler().handle(ability)).toBe(true);
    });

    it('should DENY Sales Manager access to Inventory / Products', async () => {
      const user = { id: 2, email: 'sales@test.com', roles: [2] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(() => new ReadProductPolicyHandler().handle(ability)).toThrow();
    });

    it('should DENY Sales Manager access to Settings', async () => {
      const user = { id: 2, email: 'sales@test.com', roles: [2] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(() => new ReadSettingPolicyHandler().handle(ability)).toThrow();
    });
  });

  describe('3. Inventory Manager Access Rules', () => {
    it('should ALLOW Inventory Manager to access Products', async () => {
      const user = { id: 3, email: 'inv@test.com', roles: [3] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(new ReadProductPolicyHandler().handle(ability)).toBe(true);
      expect(new CreateProductPolicyHandler().handle(ability)).toBe(true);
    });

    it('should ALLOW Inventory Manager to access Metals and Categories', async () => {
      const user = { id: 3, email: 'inv@test.com', roles: [3] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(new ReadMetalPolicyHandler().handle(ability)).toBe(true);
      expect(new ReadCategoryPolicyHandler().handle(ability)).toBe(true);
    });

    it('should ALLOW Inventory Manager to access Settings (for metal prices & categories)', async () => {
      const user = { id: 3, email: 'inv@test.com', roles: [3] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(new ReadSettingPolicyHandler().handle(ability)).toBe(true);
    });

    it('should DENY Inventory Manager access to Orders / Billing', async () => {
      const user = { id: 3, email: 'inv@test.com', roles: [3] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(() => new ReadOrderPolicyHandler().handle(ability)).toThrow();
    });

    it('should DENY Inventory Manager access to Customers', async () => {
      const user = { id: 3, email: 'inv@test.com', roles: [3] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(() => new ReadCustomerPolicyHandler().handle(ability)).toThrow();
    });
  });

  describe('4. Super Admin User & Role Management', () => {
    it('should ALLOW Super Admin to delete users', async () => {
      const user = { id: 1, email: 'admin@test.com', roles: [1] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(new DeleteUserPolicyHandler().handle(ability)).toBe(true);
    });

    it('should DENY Sales Manager from deleting users', async () => {
      const user = { id: 2, email: 'sales@test.com', roles: [2] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(() => new DeleteUserPolicyHandler().handle(ability)).toThrow();
    });

    it('should DENY Inventory Manager from deleting users', async () => {
      const user = { id: 3, email: 'inv@test.com', roles: [3] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);
      expect(() => new DeleteUserPolicyHandler().handle(ability)).toThrow();
    });

    it('should DENY non-Super Admin from managing roles', async () => {
      const salesUser = { id: 2, email: 'sales@test.com', roles: [2] } as any;
      const { ability: salesAbility } = await caslAbilityFactory.createForUser(salesUser);
      expect(() => new ReadRolePolicyHandler().handle(salesAbility)).toThrow();

      const invUser = { id: 3, email: 'inv@test.com', roles: [3] } as any;
      const { ability: invAbility } = await caslAbilityFactory.createForUser(invUser);
      expect(() => new ReadRolePolicyHandler().handle(invAbility)).toThrow();
    });
  });

  describe('5. Multi-Role Combined Permissions', () => {
    it('should COMBINE permissions for user with both Sales and Inventory Manager roles', async () => {
      const user = { id: 4, email: 'multi@test.com', roles: [2, 3] } as any;
      const { ability } = await caslAbilityFactory.createForUser(user);

      // Allowed Sales operations
      expect(new ReadOrderPolicyHandler().handle(ability)).toBe(true);
      expect(new ReadCustomerPolicyHandler().handle(ability)).toBe(true);

      // Allowed Inventory operations
      expect(new ReadProductPolicyHandler().handle(ability)).toBe(true);
      expect(new ReadSettingPolicyHandler().handle(ability)).toBe(true);

      // Still DENIED Dashboard (since neither Sales nor Inv Manager has read_dashboard)
      const dashboardHandler = new ReadDashboardPolicyHandler();
      expect(dashboardHandler.handle(ability)).toBe(false);

      // Still DENIED User Deletion (since neither has delete_user)
      expect(() => new DeleteUserPolicyHandler().handle(ability)).toThrow();
    });
  });

  describe('6. PoliciesGuard Integration Test', () => {
    it('should throw ForbiddenException when user lacks permission on guarded route', async () => {
      const mockUser = { id: 2, email: 'sales@test.com', roles: [2] };
      const context: Partial<ExecutionContext> = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: mockUser }),
        }),
      };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false); // Not public
      jest.spyOn(reflector, 'get').mockReturnValue([new ReadDashboardPolicyHandler()]);

      await expect(guard.canActivate(context as ExecutionContext)).rejects.toThrow(ForbiddenException);
    });

    it('should allow access when route is public', async () => {
      const context: Partial<ExecutionContext> = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true); // Public route

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
    });
  });
});
