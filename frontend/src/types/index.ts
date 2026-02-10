// STOKKU - Type Definitions

// Auth & Users
export type UserRole = "admin" | "manager" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Products
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number; // threshold untuk "Low Stock"
  categoryId: string;
  categoryName?: string;
  supplierId: string;
  supplierName?: string;
  image?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  description?: string;
  productCount?: number;
  createdAt?: string;
}

// Supplier
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

// Stock Movement
export type StockType = "in" | "out";
export type StockReason =
  | "purchase"
  | "sale"
  | "damaged"
  | "return"
  | "adjustment";

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  type: StockType;
  quantity: number;
  reason: StockReason;
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// Dashboard stats
export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  totalSuppliers: number;
}

// Pagination
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}
