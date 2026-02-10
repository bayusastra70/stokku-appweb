// ==========================================
// STOKKU - API Client
// ==========================================

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Get stored auth token
 */
function getToken(): string | null {
  const auth =
    localStorage.getItem("stokku_token") ||
    sessionStorage.getItem("stokku_token");
  return auth;
}

/**
 * Base fetch wrapper with auth & error handling
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  /* headers logic updated for FormData */
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - redirect to login
  if (res.status === 401) {
    localStorage.removeItem("stokku_token");
    localStorage.removeItem("stokku_user");
    sessionStorage.removeItem("stokku_token");
    sessionStorage.removeItem("stokku_user");
    window.location.href = "/login";
    throw new Error("Session berakhir. Silakan login kembali.");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP Error ${res.status}`);
  }

  return data as T;
}

// ==========================================
// Snake_case <-> camelCase converters
// ==========================================
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function mapKeys<T>(obj: any, transform: (key: string) => string): T {
  if (Array.isArray(obj))
    return obj.map((item) => mapKeys(item, transform)) as unknown as T;
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = transform(key);
      (acc as any)[newKey] = mapKeys(obj[key], transform);
      return acc;
    }, {} as any) as T;
  }
  return obj;
}

export function toCamel<T>(obj: any): T {
  return mapKeys<T>(obj, snakeToCamel);
}

export function toSnake<T>(obj: any): T {
  return mapKeys<T>(obj, camelToSnake);
}

// ==========================================
// API Methods
// ==========================================

// --- Auth ---
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<any>("/auth/me"),
};

// --- Users ---
export const userApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.search) qs.set("search", params.search);
    return request<any>(`/users?${qs}`);
  },
  getById: (id: string) => request<any>(`/users/${id}`),
  create: (data: any) =>
    request<any>("/users", {
      method: "POST",
      body: JSON.stringify(toSnake(data)),
    }),
  update: (id: string, data: any) =>
    request<any>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(toSnake(data)),
    }),
  toggleActive: (id: string) =>
    request<any>(`/users/${id}/toggle-active`, { method: "PATCH" }),
  delete: (id: string) => request<any>(`/users/${id}`, { method: "DELETE" }),
};

// --- Products ---
export const productApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: string;
    supplier_id?: string;
    low_stock?: boolean;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.search) qs.set("search", params.search);
    if (params?.category_id) qs.set("category_id", params.category_id);
    if (params?.supplier_id) qs.set("supplier_id", params.supplier_id);
    if (params?.low_stock) qs.set("low_stock", "true");
    return request<any>(`/products?${qs}`);
  },
  getById: (id: string) => request<any>(`/products/${id}`),
  create: (data: any) => {
    const isFormData = data instanceof FormData;
    return request<any>("/products", {
      method: "POST",
      body: isFormData ? data : JSON.stringify(toSnake(data)),
    });
  },
  update: (id: string, data: any) => {
    const isFormData = data instanceof FormData;
    return request<any>(`/products/${id}`, {
      method: "PUT",
      body: isFormData ? data : JSON.stringify(toSnake(data)),
    });
  },
  delete: (id: string) => request<any>(`/products/${id}`, { method: "DELETE" }),
};

// --- Categories ---
export const categoryApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.search) qs.set("search", params.search);
    return request<any>(`/categories?${qs}`);
  },
  getSimple: () => request<any[]>("/categories?simple=true"),
  getById: (id: string) => request<any>(`/categories/${id}`),
  create: (data: any) =>
    request<any>("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<any>(`/categories/${id}`, { method: "DELETE" }),
};

// --- Suppliers ---
export const supplierApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.search) qs.set("search", params.search);
    return request<any>(`/suppliers?${qs}`);
  },
  getSimple: () => request<any[]>("/suppliers?simple=true"),
  getById: (id: string) => request<any>(`/suppliers/${id}`),
  create: (data: any) =>
    request<any>("/suppliers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<any>(`/suppliers/${id}`, { method: "DELETE" }),
};

// --- Stock ---
export const stockApi = {
  record: (data: {
    productId: string;
    type: "in" | "out";
    quantity: number;
    reason: string;
    notes?: string;
  }) =>
    request<any>("/stock", {
      method: "POST",
      body: JSON.stringify(toSnake(data)),
    }),
  getLogs: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    product_id?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.type) qs.set("type", params.type);
    if (params?.product_id) qs.set("product_id", params.product_id);
    if (params?.start_date) qs.set("start_date", params.start_date);
    if (params?.end_date) qs.set("end_date", params.end_date);
    return request<any>(`/stock/logs?${qs}`);
  },
};

// --- Dashboard ---
export const dashboardApi = {
  getStats: () => request<any>("/dashboard/stats"),
  getChart: () => request<any>("/dashboard/chart"),
  getLowStock: () => request<any[]>("/dashboard/low-stock"),
  getActivity: (limit = 10) =>
    request<any[]>(`/dashboard/activity?limit=${limit}`),
};
