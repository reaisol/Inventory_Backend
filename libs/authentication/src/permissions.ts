export interface Permission {
  action: string;
  resource: string;
}
export const PERMISSIONS: Record<string, Permission> = {
  // User permissions
  create_user: {
    action: 'create',
    resource: 'users',
  },
  read_user: {
    action: 'read',
    resource: 'users',
  },
  update_user: {
    action: 'update',
    resource: 'users',
  },
  delete_user: {
    action: 'delete',
    resource: 'users',
  },
  assign_role: {
    action: 'update',
    resource: 'users',
  },
  // Role permissions
  create_role: {
    action: 'create',
    resource: 'roles',
  },
  read_role: {
    action: 'read',
    resource: 'roles',
  },
  update_role: {
    action: 'update',
    resource: 'roles',
  },
  delete_role: {
    action: 'delete',
    resource: 'roles',
  },
  list_permissions: {
    action: 'read',
    resource: 'roles',
  },
  // Metal permissions
  read_metal_type: {
    action: 'read',
    resource: 'metals',
  },
  read_metal_purity: {
    action: 'read',
    resource: 'metals',
  },
  create_metal_price: {
    action: 'create',
    resource: 'metals',
  },
  read_metal_price: {
    action: 'read',
    resource: 'metals',
  },
  update_metal_price: {
    action: 'update',
    resource: 'metals',
  },
  delete_metal_price: {
    action: 'delete',
    resource: 'metals',
  },
  // Category permissions
  create_category: {
    action: 'create',
    resource: 'categories',
  },
  read_category: {
    action: 'read',
    resource: 'categories',
  },
  update_category: {
    action: 'update',
    resource: 'categories',
  },
  delete_category: {
    action: 'delete',
    resource: 'categories',
  },
  // Product permissions
  create_product: {
    action: 'create',
    resource: 'products',
  },
  read_product: {
    action: 'read',
    resource: 'products',
  },
  update_product: {
    action: 'update',
    resource: 'products',
  },
  delete_product: {
    action: 'delete',
    resource: 'products',
  },
  calculate_product_price: {
    action: 'read',
    resource: 'products',
  },
  // Customer permissions
  create_customer: {
    action: 'create',
    resource: 'customers',
  },
  read_customer: {
    action: 'read',
    resource: 'customers',
  },
  update_customer: {
    action: 'update',
    resource: 'customers',
  },
  delete_customer: {
    action: 'delete',
    resource: 'customers',
  },
  // Order permissions
  create_order: {
    action: 'create',
    resource: 'orders',
  },
  read_order: {
    action: 'read',
    resource: 'orders',
  },
  update_order: {
    action: 'update',
    resource: 'orders',
  },
  cancel_order: {
    action: 'update',
    resource: 'orders',
  },
  // Settings permissions
  create_setting: {
    action: 'create',
    resource: 'settings',
  },
  read_setting: {
    action: 'read',
    resource: 'settings',
  },
  update_setting: {
    action: 'update',
    resource: 'settings',
  },
  delete_setting: {
    action: 'delete',
    resource: 'settings',
  },
  // Expense permissions
  create_expense: {
    action: 'create',
    resource: 'expenses',
  },
  read_expense: {
    action: 'read',
    resource: 'expenses',
  },
  update_expense: {
    action: 'update',
    resource: 'expenses',
  },
  delete_expense: {
    action: 'delete',
    resource: 'expenses',
  },
};
