export interface LoginRequest {
  email: string;
  password: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface GetRolesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface RolesListResponse {
  data: Role[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface CreateRoleRequest {
  name: string;
  permissions: string[];
}

export interface CreateRoleResponse extends Role {}

export interface UpdateRoleRequest {
  name?: string;
  permissions?: string[];
}

export interface UpdateRoleResponse extends Role {}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface UsersListResponse {
  data: User[];
  meta: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleIds: number[];
}

export interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  roleIds?: number[];
}

export type UpdateUserResponse = User;

export interface MetalType {
  id: number;
  name: string;
  code: string;
}

export interface MetalPurity {
  id: number;
  name: string;
  code: string;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoriesResponse = Category[];

export interface Product {
  id: number;
  productId: string;
  name: string;
  metalType: MetalType;
  metalPurity: MetalPurity;
  category: Category;
  grossWeightGm: number;
  grossWeightCt: number;
  stoneWeightGm: number;
  stoneWeightCt: number;
  stoneCost: number;
  wastagePercentage: number;
  makingChargesPercentage: number;
  barcode: string;
  status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'SOLD';
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  metalTypeId?: number;
  categoryId?: number;
  status?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'SOLD';
}

export interface ProductsListResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface CreateProductRequest {
  name: string;
  metalTypeId: number;
  metalPurityId: number;
  categoryId: number;
  grossWeightGm: number;
  grossWeightCt: number;
  stoneWeightGm: number;
  stoneWeightCt: number;
  stoneCost: number;
  wastagePercentage: number;
  makingChargesPercentage: number;
  barcode: string;
  additionalNotes?: string;
}

export interface CreateProductResponse {
  id: number;
  productId: string;
  name: string;
  metalType: MetalType;
  metalPurity: MetalPurity;
  category: Category;
  grossWeightGm: number;
  grossWeightCt: number;
  stoneWeightGm: number;
  stoneWeightCt: number;
  stoneCost: number;
  wastagePercentage: number;
  makingChargesPercentage: number;
  barcode: string;
  status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'SOLD';
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProductRequest {
  name?: string;
  metalTypeId?: number;
  metalPurityId?: number;
  categoryId?: number;
  grossWeightGm?: number;
  grossWeightCt?: number;
  stoneWeightGm?: number;
  stoneWeightCt?: number;
  stoneCost?: number;
  wastagePercentage?: number;
  makingChargesPercentage?: number;
  barcode?: string;
  status?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'SOLD';
  additionalNotes?: string;
}

export type UpdateProductResponse = Product;

// Product Price Calculation Types
export interface ProductPriceResponse {
  basePrice: number;
  wastageAmount: number;
  makingChargesAmount: number;
  stoneCost: number;
  totalPrice: number;
  pricePerGram: string;
  effectiveDate: string;
}

export interface MetalPurity {
  id: number;
  metalTypeId: number;
  name: string;
  code: string;
  purityPercentage: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetalTypeWithPurities extends MetalType {
  purities: MetalPurity[];
}

export type MetalTypesResponse = MetalTypeWithPurities[];

// Metal Purity Price Types
export interface MetalPurityPrice {
  id: number;
  metalPurity: {
    id: number;
    metalTypeId: number;
    name: string;
    code: string;
    purityPercentage: string;
    createdAt: string;
    updatedAt: string;
    metalType: {
      id: number;
      name: string;
      code: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  pricePerGram: string;
  effectiveDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMetalPurityPriceRequest {
  pricePerGram: number;
}

// Dashboard Types
export interface MetricValue {
  value: number;
  change: number;
  isPositive: boolean;
}

export interface SalesTrendData {
  date: string;
  goldSales: number;
  silverSales: number;
}

export interface TopCategoryByRevenue {
  category: string;
  revenue: number;
}

export interface SalesDashboardResponse {
  totalSalesToday: MetricValue;
  goldSold: MetricValue;
  silverSold: MetricValue;
  oldGoldCredit: MetricValue;
  salesTrend: SalesTrendData[];
  topCategoriesByRevenue: TopCategoryByRevenue[];
}

export interface InventoryFlowTrendData {
  date: string;
  itemsAdded: number;
  itemsSold: number;
}

export interface StockDistributionByPurity {
  purity: string;
  stock: number;
}

export interface InventoryDashboardResponse {
  totalInventoryValue: number;
  totalMetalStockGm: number;
  totalItems: number;
  mostStockedCategory: string;
  inventoryFlowTrend: InventoryFlowTrendData[];
  stockDistributionByPurity: StockDistributionByPurity[];
}

// Customer Types
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface CustomersListResponse {
  data: Customer[];
  meta: {
    page: number;
    limit: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export type CreateCustomerResponse = Customer;

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type UpdateCustomerResponse = Customer;

