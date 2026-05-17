import { createContext, useContext, useState, type ReactNode } from "react";
import {
  userService,
  type User,
  type PaginatedResponse,
  type CreateUserRequest,
  type UpdateUserRequest,
  type UserFilters,
} from "../services/userService";

interface UserContextType {
  users: User[];
  selectedUser: User | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (data: CreateUserRequest) => Promise<void>;
  updateUser: (id: string, data: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setFilters: (filters: UserFilters) => void;
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<UserFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (newFilters?: UserFilters) => {
    setIsLoading(true);
    setError(null);

    const currentFilters = newFilters || filters;

    try {
      const response: PaginatedResponse<User> = await userService.getUsers(currentFilters);

      setUsers(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      });
      setFilters(currentFilters);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    }
  };

  const fetchUserById = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await userService.getUserById(id);
      setSelectedUser(user);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to fetch user details");
    }
  };

  const createUser = async (data: CreateUserRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      await userService.createUser(data);
      // Refresh user list after creation
      await fetchUsers();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to create user");
      throw err;
    }
  };

  const updateUser = async (id: string, data: UpdateUserRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await userService.updateUser(id, data);

      // Update user in list
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === id ? updatedUser : u)));
      if (selectedUser?.id === id) {
        setSelectedUser(updatedUser);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to update user");
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await userService.deleteUser(id);

      // Remove user from list
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== id));
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to delete user");
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <UserContext.Provider
      value={{
        users,
        selectedUser,
        pagination,
        filters,
        isLoading,
        error,
        fetchUsers,
        fetchUserById,
        createUser,
        updateUser,
        deleteUser,
        setFilters,
        setSelectedUser,
        clearError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
