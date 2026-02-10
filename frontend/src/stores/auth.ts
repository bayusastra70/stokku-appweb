import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, LoginCredentials, UserRole } from "@/types";
import { authApi, toCamel } from "@/services/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed(() => user.value?.role || null);
  const isAdmin = computed(() => user.value?.role === "admin");
  const isManager = computed(
    () => user.value?.role === "manager" || user.value?.role === "admin",
  );

  // Check permission
  function hasRole(roles: UserRole[]): boolean {
    if (!user.value) return false;
    return roles.includes(user.value.role);
  }

  // Initialize from localStorage
  function init() {
    const storedUser =
      localStorage.getItem("stokku_user") ||
      sessionStorage.getItem("stokku_user");
    const storedToken =
      localStorage.getItem("stokku_token") ||
      sessionStorage.getItem("stokku_token");
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("stokku_user");
        localStorage.removeItem("stokku_token");
      }
    }
  }

  // Login
  async function login(credentials: LoginCredentials): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await authApi.login(
        credentials.email,
        credentials.password,
      );
      const mappedUser = toCamel<User>(result.user);
      user.value = mappedUser;

      const storage = credentials.rememberMe ? localStorage : sessionStorage;
      storage.setItem("stokku_token", result.token);
      storage.setItem("stokku_user", JSON.stringify(mappedUser));

      isLoading.value = false;
      return true;
    } catch (err: any) {
      error.value = err.message || "Login gagal. Coba lagi.";
      isLoading.value = false;
      return false;
    }
  }

  // Logout
  function logout() {
    user.value = null;
    localStorage.removeItem("stokku_token");
    localStorage.removeItem("stokku_user");
    sessionStorage.removeItem("stokku_token");
    sessionStorage.removeItem("stokku_user");
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    userRole,
    isAdmin,
    isManager,
    hasRole,
    init,
    login,
    logout,
  };
});
