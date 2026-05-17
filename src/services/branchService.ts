import { api } from "../lib/api-client";
import { API_ENDPOINTS } from "./apiEndpoints";

export interface BranchCreateDto {
  name: string;
  code: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  organizationId: string;
  logo?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pincode?: string;
  countryId?: string;
  stateId?: string;
  districtId?: string;
}

export interface BranchUpdateDto {
  name?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  active?: boolean;
  logo?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pincode?: string;
  countryId?: string;
  stateId?: string;
  districtId?: string;
}

export interface BranchResponseDto {
  id: string;
  name: string;
  code: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  isMain: boolean;
  isActive: boolean;
  logo?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pincode?: string;
  countryId?: string;
  countryName?: string;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  organizationId: string;
}

/**
 * Branch Management Service
 * Handles all branch-related API calls
 */
export const branchService = {
  /**
   * Create a new branch
   */
  async createBranch(data: BranchCreateDto): Promise<BranchResponseDto> {
    try {
      return await api.post<BranchResponseDto>(API_ENDPOINTS.BRANCHES.BASE, data);
    } catch {
      throw new Error("Failed to create branch.");
    }
  },

  /**
   * Get branch by ID
   */
  async getBranchById(id: string): Promise<BranchResponseDto> {
    try {
      return await api.get<BranchResponseDto>(API_ENDPOINTS.BRANCHES.BY_ID(id));
    } catch {
      throw new Error("Failed to fetch branch details.");
    }
  },

  /**
   * Get all branches for an organization
   */
  async getBranchesByOrganization(organizationId: string): Promise<BranchResponseDto[]> {
    try {
      return await api.get<BranchResponseDto[]>(API_ENDPOINTS.BRANCHES.BY_ORG(organizationId));
    } catch {
      throw new Error("Failed to fetch branches for the organization.");
    }
  },

  /**
   * Update an existing branch
   */
  async updateBranch(id: string, data: BranchUpdateDto): Promise<BranchResponseDto> {
    try {
      return await api.put<BranchResponseDto>(API_ENDPOINTS.BRANCHES.BY_ID(id), data);
    } catch {
      throw new Error("Failed to update branch.");
    }
  },

  /**
   * Update branch status (active/inactive)
   */
  async updateBranchStatus(id: string, active: boolean): Promise<BranchResponseDto> {
    try {
      return await api.patch<BranchResponseDto>(API_ENDPOINTS.BRANCHES.STATUS(id), { active });
    } catch {
      throw new Error("Failed to update branch status.");
    }
  },
};
