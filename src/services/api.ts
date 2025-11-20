import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ApiError,
  User,
  GetUsersParams,
  UsersListResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  GetProductsParams,
  ProductsListResponse,
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  MetalTypesResponse,
  CategoriesResponse,
  Product,
  SalesDashboardResponse,
  InventoryDashboardResponse,
  Customer,
  GetCustomersParams,
  CustomersListResponse,
  CreateCustomerRequest,
  CreateCustomerResponse,
  UpdateCustomerRequest,
  UpdateCustomerResponse,
  Role,
  GetRolesParams,
  RolesListResponse,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  MetalPurityPrice,
  UpdateMetalPurityPriceRequest,
  ProductPriceResponse,
} from './types';

const API_BASE_URL = 'http://localhost:3002';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<RefreshTokenResponse> | null = null;

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw {
      message: 'No refresh token available',
      status: 401,
    } as ApiError;
  }

  const url = `${API_BASE_URL}/auth/refresh`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to refresh token';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      // Clear auth data if refresh fails
      clearAuthData();
      
      throw {
        message: errorMessage,
        status: response.status,
      } as ApiError;
    }

    const data = await response.json();
    // Store the new tokens
    storeAuthData(data);
    
    return data;
  } catch (error) {
    // Clear auth data on any error during refresh
    clearAuthData();
    
    if (error && typeof error === 'object' && 'message' in error) {
      throw error;
    }
    throw {
      message: error instanceof Error ? error.message : 'Network error occurred',
    } as ApiError;
  }
}

/**
 * Makes an API request with proper error handling and automatic token refresh
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryOn401: boolean = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add auth token if available
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && retryOn401) {
      // If we're already refreshing, wait for that to complete
      if (isRefreshing && refreshPromise) {
        try {
          await refreshPromise;
          // Retry the original request with new token
          return apiRequest<T>(endpoint, options, false);
        } catch {
          // Refresh failed, throw error
          throw {
            message: 'Session expired. Please login again.',
            status: 401,
          } as ApiError;
        }
      }

      // Start refresh process
      isRefreshing = true;
      refreshPromise = refreshAccessToken();

      try {
        await refreshPromise;
        // Retry the original request with new token
        return apiRequest<T>(endpoint, options, false);
      } catch (refreshError) {
        throw {
          message: 'Session expired. Please login again.',
          status: 401,
        } as ApiError;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw {
        message: errorMessage,
        status: response.status,
      } as ApiError;
    }

    return await response.json();
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error;
    }
    throw {
      message: error instanceof Error ? error.message : 'Network error occurred',
    } as ApiError;
  }
}

/**
 * Login API call
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }, false); // Don't retry on 401 for login endpoint
}

/**
 * Refresh token API call
 */
export async function refreshToken(refreshTokenValue?: string): Promise<RefreshTokenResponse> {
  const token = refreshTokenValue || getRefreshToken();
  
  if (!token) {
    throw {
      message: 'No refresh token available',
      status: 401,
    } as ApiError;
  }

  return apiRequest<RefreshTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
  }, false); // Don't retry on 401 for refresh endpoint
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

/**
 * Get stored user data
 */
export function getUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Store authentication data
 */
export function storeAuthData(data: LoginResponse | RefreshTokenResponse): void {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: GetUsersParams | GetProductsParams): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get all users with optional query parameters
 */
export async function getUsers(params?: GetUsersParams): Promise<UsersListResponse> {
  const queryString = params ? buildQueryString(params) : '';
  return apiRequest<UsersListResponse>(`/users${queryString}`, {
    method: 'GET',
  });
}

/**
 * Create a new user
 */
export async function createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
  return apiRequest<CreateUserResponse>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Get a user by ID
 */
export async function getUserById(id: number): Promise<User> {
  return apiRequest<User>(`/users/${id}`, {
    method: 'GET',
  });
}

/**
 * Update a user by ID
 */
export async function updateUser(id: number, userData: UpdateUserRequest): Promise<UpdateUserResponse> {
  return apiRequest<UpdateUserResponse>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
}

/**
 * Delete a user by ID
 */
export async function deleteUser(id: number): Promise<void> {
  return apiRequest<void>(`/users/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get all products with optional query parameters
 */
export async function getProducts(params?: GetProductsParams): Promise<ProductsListResponse> {
  const queryString = params ? buildQueryString(params) : '';
  return apiRequest<ProductsListResponse>(`/products${queryString}`, {
    method: 'GET',
  });
}

/**
 * Create a new product
 */
export async function createProduct(productData: CreateProductRequest): Promise<CreateProductResponse> {
  return apiRequest<CreateProductResponse>('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

/**
 * Get a product by ID
 */
export async function getProductById(id: number): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`, {
    method: 'GET',
  });
}

export async function getProductByProductId(productId: string): Promise<Product> {
  return apiRequest<Product>(`/products/product-id/${productId}`, {
    method: 'GET',
  });
}
/**
 * Update a product by ID
 */
export async function updateProduct(id: number, productData: UpdateProductRequest): Promise<UpdateProductResponse> {
  return apiRequest<UpdateProductResponse>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
  });
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(id: number): Promise<void> {
  return apiRequest<void>(`/products/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get all metal types with their purities
 */
export async function getMetalTypes(): Promise<MetalTypesResponse> {
  return apiRequest<MetalTypesResponse>('/metals/types', {
    method: 'GET',
  });
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<CategoriesResponse> {
  return apiRequest<CategoriesResponse>('/categories', {
    method: 'GET',
  });
}

/**
 * Get sales dashboard data
 */
export async function getSalesDashboard(): Promise<SalesDashboardResponse> {
  return apiRequest<SalesDashboardResponse>('/dashboard/sales', {
    method: 'GET',
  });
}

/**
 * Get inventory dashboard data
 */
export async function getInventoryDashboard(): Promise<InventoryDashboardResponse> {
  return apiRequest<InventoryDashboardResponse>('/dashboard/inventory', {
    method: 'GET',
  });
}

/**
 * Get all customers with pagination
 */
export async function getCustomers(params?: GetCustomersParams): Promise<CustomersListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `/customers${queryString ? `?${queryString}` : ''}`;

  return apiRequest<CustomersListResponse>(url, {
    method: 'GET',
  });
}

/**
 * Get a customer by ID
 */
export async function getCustomerById(id: number): Promise<Customer> {
  return apiRequest<Customer>(`/customers/${id}`, {
    method: 'GET',
  });
}

/**
 * Create a new customer
 */
export async function createCustomer(customerData: CreateCustomerRequest): Promise<CreateCustomerResponse> {
  return apiRequest<CreateCustomerResponse>('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
}

/**
 * Update a customer
 */
export async function updateCustomer(id: number, customerData: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
  return apiRequest<UpdateCustomerResponse>(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(customerData),
  });
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: number): Promise<void> {
  return apiRequest<void>(`/customers/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get product by barcode
 */
export async function getProductByBarcode(barcode: string): Promise<Product> {
  return apiRequest<Product>(`/products/barcode/${encodeURIComponent(barcode)}`, {
    method: 'GET',
  });
}

/**
 * Get product price calculation by product ID
 */
export async function getProductPrice(productId: number): Promise<ProductPriceResponse> {
  return apiRequest<ProductPriceResponse>(`/products/${productId}/price`, {
    method: 'GET',
  });
}

/**
 * Get metal purity price by purity ID
 */
export async function getMetalPurityPrice(purityId: number): Promise<MetalPurityPrice> {
  return apiRequest<MetalPurityPrice>(`/metals/purities/${purityId}/price`, {
    method: 'GET',
  });
}

/**
 * Update metal purity price
 */
export async function updateMetalPurityPrice(
  purityId: number,
  priceData: UpdateMetalPurityPriceRequest
): Promise<MetalPurityPrice> {
  return apiRequest<MetalPurityPrice>(`/metals/purities/${purityId}/price`, {
    method: 'PATCH',
    body: JSON.stringify(priceData),
  });
}

/**
 * Get all roles with optional query parameters
 */
export async function getRoles(params?: GetRolesParams): Promise<RolesListResponse> {
  const queryString = params ? buildQueryString(params) : '';
  return apiRequest<RolesListResponse>(`/roles${queryString}`, {
    method: 'GET',
  });
}

/**
 * Get a role by ID
 */
export async function getRoleById(id: number): Promise<Role> {
  return apiRequest<Role>(`/roles/${id}`, {
    method: 'GET',
  });
}

/**
 * Create a new role
 */
export async function createRole(roleData: CreateRoleRequest): Promise<CreateRoleResponse> {
  return apiRequest<CreateRoleResponse>('/roles', {
    method: 'POST',
    body: JSON.stringify(roleData),
  });
}

/**
 * Update a role by ID
 */
export async function updateRole(id: number, roleData: UpdateRoleRequest): Promise<UpdateRoleResponse> {
  return apiRequest<UpdateRoleResponse>(`/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(roleData),
  });
}

/**
 * Delete a role by ID
 */
export async function deleteRole(id: number): Promise<void> {
  return apiRequest<void>(`/roles/${id}`, {
    method: 'DELETE',
  });
}

