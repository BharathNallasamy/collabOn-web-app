import { api } from "../lib/api-client";
import { API_ENDPOINTS } from "./apiEndpoints";

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  mobile: string;
  role: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  mobile?: string;
  role?: string;
  status?: "active" | "inactive" | "suspended";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

/**
 * User Management Service
 * Handles all user-related API calls
 */
export const userService = {
  /**
   * Get list of users with filters and pagination
   */
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams();

      if (filters?.search) params.append("search", filters.search);
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());

      return await api.get<PaginatedResponse<User>>(`${API_ENDPOINTS.USERS.BASE}?${params.toString()}`);
    } catch {
      throw new Error("Failed to fetch users.");
    }
  },

  /**
   * Get single user by ID
   */
  async getUserById(id: string): Promise<User> {
    try {
      return await api.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
    } catch {
      throw new Error("Failed to fetch user details.");
    }
  },

  /**
   * Create new user
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      return await api.post<User>(API_ENDPOINTS.USERS.BASE, data);
    } catch {
      throw new Error("Failed to create user.");
    }
  },

  /**
   * Update existing user
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      return await api.put<User>(API_ENDPOINTS.USERS.BY_ID(id), data);
    } catch {
      throw new Error("Failed to update user.");
    }
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    try {
      return await api.delete(API_ENDPOINTS.USERS.BY_ID(id));
    } catch {
      throw new Error("Failed to delete user.");
    }
  },

  /**
   * Get user roles
   */
  async getRoles(): Promise<Array<{ id: string; name: string; permissions: string[] }>> {
    try {
      return await api.get(API_ENDPOINTS.USERS.ROLES);
    } catch {
      throw new Error("Failed to fetch roles.");
    }
  },

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string): Promise<{ message: string }> {
    try {
      return await api.post(API_ENDPOINTS.USERS.ASSIGN_ROLE(userId), { roleId });
    } catch {
      throw new Error("Failed to assign role.");
    }
  },

  /**
   * Update user status
   */
  async updateStatus(userId: string, status: "active" | "inactive" | "suspended"): Promise<User> {
    try {
      return await api.patch<User>(API_ENDPOINTS.USERS.STATUS(userId), { status });
    } catch {
      throw new Error("Failed to update user status.");
    }
  },
};
