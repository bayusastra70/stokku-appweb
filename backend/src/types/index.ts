// ==========================================
// STOKKU - TypeScript Type Definitions
// ==========================================

export type UserRole = "admin" | "manager" | "staff";
export type StockType = "in" | "out";
export type StockReason =
  | "purchase"
  | "sale"
  | "damaged"
  | "return"
  | "adjustment";

// Database row types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  min_stock: number;
  category_id: string;
  supplier_id: string;
  image?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  category_name?: string;
  supplier_name?: string;
}

export interface StockLog {
  id: string;
  product_id: string;
  user_id: string;
  type: StockType;
  quantity: number;
  reason: StockReason;
  notes?: string;
  created_at: string;
  // Joined fields
  product_name?: string;
  user_name?: string;
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, "password">;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Dashboard types
export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  totalSuppliers: number;
  totalStockValue: number;
}

export interface ChartData {
  labels: string[];
  stockIn: number[];
  stockOut: number[];
}
