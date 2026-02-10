import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  // === AUTH ===
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/auth/LoginPage.vue"),
    meta: { requiresAuth: false, layout: "auth" },
  },
  {
    path: "/unauthorized",
    name: "Unauthorized",
    component: () => import("@/pages/auth/UnauthorizedPage.vue"),
    meta: { requiresAuth: false, layout: "auth" },
  },
  // === MAIN APP (requires auth) ===
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/pages/dashboard/DashboardPage.vue"),
    meta: { requiresAuth: true, title: "Dashboard" },
  },
  // --- Products ---
  {
    path: "/products",
    name: "Products",
    component: () => import("@/pages/products/ProductListPage.vue"),
    meta: { requiresAuth: true, title: "Produk" },
  },
  {
    path: "/products/add",
    name: "AddProduct",
    component: () => import("@/pages/products/ProductFormPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Tambah Produk",
      roles: ["admin", "manager"],
    },
  },
  {
    path: "/products/:id/edit",
    name: "EditProduct",
    component: () => import("@/pages/products/ProductFormPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Edit Produk",
      roles: ["admin", "manager"],
    },
  },
  {
    path: "/products/:id",
    name: "ProductDetail",
    component: () => import("@/pages/products/ProductDetailPage.vue"),
    meta: { requiresAuth: true, title: "Detail Produk" },
  },
  // --- Stock ---
  {
    path: "/stock/in",
    name: "StockIn",
    component: () => import("@/pages/stock/StockInPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Barang Masuk",
      roles: ["admin", "manager"],
    },
  },
  {
    path: "/stock/out",
    name: "StockOut",
    component: () => import("@/pages/stock/StockOutPage.vue"),
    meta: {
      requiresAuth: true,
      title: "Barang Keluar",
      roles: ["admin", "manager"],
    },
  },
  {
    path: "/stock/logs",
    name: "StockLogs",
    component: () => import("@/pages/stock/StockLogsPage.vue"),
    meta: { requiresAuth: true, title: "Riwayat Stok" },
  },
  // --- Master Data ---
  {
    path: "/categories",
    name: "Categories",
    component: () => import("@/pages/master/CategoryPage.vue"),
    meta: { requiresAuth: true, title: "Kategori" },
  },
  {
    path: "/suppliers",
    name: "Suppliers",
    component: () => import("@/pages/master/SupplierPage.vue"),
    meta: { requiresAuth: true, title: "Supplier" },
  },
  // --- Users (Admin Only) ---
  {
    path: "/users",
    name: "Users",
    component: () => import("@/pages/users/UserListPage.vue"),
    meta: { requiresAuth: true, title: "Manajemen User", roles: ["admin"] },
  },
  // --- Reports ---
  {
    path: "/reports",
    name: "Reports",
    component: () => import("@/pages/reports/ReportPage.vue"),
    meta: { requiresAuth: true, title: "Laporan", roles: ["admin", "manager"] },
  },
  // --- Catch All ---
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
// Helper to get from local or session storage
function getStorageItem(key: string): string | null {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

// Navigation Guard
router.beforeEach((to, _from, next) => {
  const token = getStorageItem("stokku_token");
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
    return;
  }

  if (to.path === "/login" && isAuthenticated) {
    next("/dashboard");
    return;
  }

  // Role-based guard
  if (to.meta.roles) {
    const userStr = getStorageItem("stokku_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const allowedRoles = to.meta.roles as string[];
      if (!allowedRoles.includes(user.role)) {
        next("/unauthorized");
        return;
      }
    }
  }

  next();
});

export default router;
