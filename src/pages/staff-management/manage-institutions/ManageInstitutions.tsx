import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronDown, MapPin, Edit3, FileText, Info } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Button from "../../../components/common/Button/Button";
import Card from "../../../components/common/Card";
import Modal from "../../../components/common/Modal/Modal";
import DataTable from "../../../components/common/Table/DataTable";
import { branchService } from "../../../components/services/branchService";
import { type BranchItem } from "../../../types/interfaces";
import { SEED_BRANCHES as MOCK_LIST_DATA } from "../../../types/mockData";

interface InputFieldProps {
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  value?: string;
  onChange?: (val: string) => void;
}

const InputField = ({
  label,
  placeholder,
  required = false,
  type = "text",
  value = "",
  onChange = () => {},
}: InputFieldProps) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <label className="text-[14px] font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-4 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] transition-all"
    />
  </div>
);

interface SelectFieldProps {
  label: string;
  required?: boolean;
  value?: string;
  onChange?: (val: string) => void;
}

const SelectField = ({
  label,
  required = false,
  value = "",
  onChange = () => {},
}: SelectFieldProps) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <label className="text-[14px] font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] transition-all appearance-none bg-white font-medium text-gray-400"
      >
        <option value="">Select</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
    </div>
  </div>
);

const ManageInstitutions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("mode");
  const editId = searchParams.get("id");
  const isEditing = view === "edit";
  const { useApi } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveSuccessOpen, setIsSaveSuccessOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    poc: "",
    address: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    county: "",
    code: "",
    latitude: "",
    longitude: "",
    radius: "10",
    isActive: true,
  });

  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgId = "550e8400-e29b-41d4-a716-446655440000";
      const data = await branchService.getBranchesByOrganization(orgId);
      setBranches(data as BranchItem[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch branches";
      setError(errorMessage);
      setBranches([]); // Clear branches to show error in emptyMessage
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch branches when useApi changes or on mount
  useEffect(() => {
    if (useApi) {
      fetchBranches();
    } else {
      setBranches(MOCK_LIST_DATA);
    }
  }, [useApi, fetchBranches]);

  const handleSave = async () => {
    if (!useApi) {
      setIsSaveSuccessOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const branchData = {
        name: formData.name,
        code: formData.code || "BR-" + Math.floor(Math.random() * 1000),
        address: formData.address,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        organizationId: "550e8400-e29b-41d4-a716-446655440000", // Hardcoded for demonstration
        city: formData.city,
        pincode: formData.pincode,
        stateId: formData.state,
      };

      if (isEditing && editId) {
        await branchService.updateBranch(editId, branchData);
      } else {
        await branchService.createBranch(branchData);
      }

      setIsSaveSuccessOpen(true);
      fetchBranches(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save branch";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = !formData.isActive;
    updateField("isActive", newStatus.toString()); // Local update

    if (useApi && isEditing && editId) {
      try {
        await branchService.updateBranchStatus(editId, newStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update status");
        updateField("isActive", (!newStatus).toString()); // Rollback
      }
    }
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditing && editId) {
      const institution = branches.find((item) => item.id === editId);
      if (institution) {
        setFormData({
          name: institution.name || "",
          phone: institution.contactPhone || institution.phone || "",
          email: institution.contactEmail || institution.email || "",
          poc: institution.poc || "N/A",
          address: institution.address || "",
          landmark: "",
          pincode: institution.pincode || "",
          city: institution.city || "",
          state: institution.stateId || "",
          county: "",
          code: institution.code || "",
          latitude: "",
          longitude: "",
          radius: institution.radius?.toString() || "10",
          isActive: institution.isActive ?? true,
        });
      }

      // Fetch fresh details from API if enabled
      if (useApi) {
        branchService
          .getBranchById(editId)
          .then((data) => {
            setFormData({
              name: data.name,
              phone: data.contactPhone || "",
              email: data.contactEmail || "",
              poc: "N/A",
              address: data.address || "",
              landmark: "",
              pincode: data.pincode || "",
              city: data.city || "",
              state: data.stateId || "",
              county: "",
              code: data.code || "",
              latitude: "",
              longitude: "",
              radius: "10",
              isActive: data.isActive,
            });
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Failed to fetch branch details");
          });
      }
    } else if (view === "add") {
      setFormData({
        name: "",
        phone: "",
        email: "",
        poc: "",
        address: "",
        landmark: "",
        pincode: "",
        city: "",
        state: "",
        county: "",
        code: "",
        latitude: "",
        longitude: "",
        radius: "10",
        isActive: true,
      });
    }
  }, [isEditing, editId, view, branches, useApi]);

  const totalItems = branches.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = branches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns = [
    {
      key: "name",
      header: "Institution Name",
      render: (item: BranchItem) => (
        <span className="text-[13px] font-medium text-gray-700">{item.name}</span>
      ),
    },
    {
      key: "radius",
      header: "Allowed Radius (meter)",
      render: (item: BranchItem) => (
        <span className="text-[13px] font-medium text-gray-700">{item.radius || "10"}</span>
      ),
    },
    {
      key: "assignedEmployees",
      header: "Assigned Employees",
      render: (item: BranchItem) => (
        <span className="text-[13px] font-medium text-gray-700">
          {item.assignedEmployees || "0"}
        </span>
      ),
    },
    {
      key: "createdOn",
      header: "Created On",
      render: (item: BranchItem) => (
        <span className="text-[13px] font-medium text-gray-700">{item.createdOn || "N/A"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: BranchItem) => (
        <span className="text-[13px] font-medium text-gray-700">
          {item.isActive || item.status === "Active" ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  if (!view) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-6">
              <h1 className="text-[18px] font-bold text-gray-900">Manage Institution</h1>
            </div>

            <Button
              variant="primary"
              className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 gap-2 h-11 px-6 rounded-lg font-bold shadow-md shadow-[#1D6BA3]/10"
              onClick={() => setSearchParams({ mode: "add" })}
              icon={<Plus size={20} />}
            >
              Add Institution Branch
            </Button>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs font-medium">
              <Info size={14} />
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#1D6BA3]/20 border-t-[#1D6BA3] rounded-full animate-spin" />
            </div>
          )}
          <div className="overflow-x-auto">
            <DataTable
              data={currentItems}
              columns={[
                ...columns,
                {
                  key: "actions",
                  header: "Actions",
                  render: (item: BranchItem) => (
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 bg-[#EBF5FB] hover:bg-blue-100 rounded-lg text-[#1D6BA3] transition-colors"
                        onClick={() => setSearchParams({ mode: "edit", id: item.id })}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button className="p-2 bg-[#EBF5FB] hover:bg-blue-100 rounded-lg text-[#1D6BA3] transition-colors">
                        <FileText size={16} />
                      </button>
                    </div>
                  ),
                },
              ]}
              headerRowClassName="bg-[#F1F8FD] border-b border-gray-100"
              showPagination={true}
              pagination={{
                currentPage: currentPage,
                totalPages: totalPages,
                pageSize: itemsPerPage,
                total: totalItems,
                onPageChange: (page) => setCurrentPage(page),
              }}
              emptyMessage={error && useApi ? `Error: ${error}` : "No institutions found"}
            />
          </div>
        </div>
      </div>
    );
  }

  const updateField = (field: string, val: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Title Card */}
      <div className="bg-white rounded-xl border border-gray-200 px-6 py-5 shadow-sm transform transition-all duration-300">
        <h1 className="text-[16px] font-bold text-gray-900">
          {isEditing ? "Edit Institution" : "Add Institution"}
        </h1>
      </div>

      {/* Main Form */}
      <div className="space-y-6">
        <Card noPadding className="border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/30">
            <h2 className="text-[15px] font-bold text-gray-700">Institution Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InputField
                label="Institution Name"
                placeholder="Enter Name"
                required
                value={formData.name}
                onChange={(v: string) => updateField("name", v)}
              />
              <InputField
                label="Phone Number"
                placeholder="+91"
                required
                value={formData.phone}
                onChange={(v: string) => updateField("phone", v)}
              />
              <InputField
                label="Email"
                placeholder="Enter"
                required
                value={formData.email}
                onChange={(v: string) => updateField("email", v)}
              />
              <InputField
                label="Point of Contact"
                placeholder="Enter"
                required
                value={formData.poc}
                onChange={(v: string) => updateField("poc", v)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-gray-700">Address</label>
              <textarea
                rows={4}
                placeholder="Enter"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InputField
                label="Landmark"
                placeholder="Enter"
                value={formData.landmark}
                onChange={(v: string) => updateField("landmark", v)}
              />
              <SelectField
                label="Pin Code"
                value={formData.pincode}
                onChange={(v: string) => updateField("pincode", v)}
              />
              <SelectField
                label="City"
                value={formData.city}
                onChange={(v: string) => updateField("city", v)}
              />
              <SelectField
                label="State"
                value={formData.state}
                onChange={(v: string) => updateField("state", v)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <SelectField
                label="County"
                value={formData.county}
                onChange={(v: string) => updateField("county", v)}
              />
              <SelectField
                label="Institution Code"
                value={formData.code}
                onChange={(v: string) => updateField("code", v)}
              />
              <div className="space-y-2">
                <p className="text-[14px] font-medium text-gray-700">Status</p>
                <div className="flex items-center gap-2">
                  <div
                    onClick={handleStatusToggle}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.isActive ? "bg-[#1D6BA3]" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isActive ? "right-1" : "left-1"}`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card noPadding className="border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/30">
            <h2 className="text-[15px] font-bold text-gray-700">Geo Fencing Details</h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 h-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                <MapPin size={14} className="text-gray-400" /> Find Current Location
              </button>
              <button className="flex items-center gap-2 px-4 h-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                <MapPin size={14} className="text-gray-400" /> Find Location From Address
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InputField
                label="Latitude"
                placeholder="Enter Name"
                required
                value={formData.latitude}
                onChange={(v: string) => updateField("latitude", v)}
              />
              <InputField
                label="Longitude"
                placeholder="Enter Name"
                required
                value={formData.longitude}
                onChange={(v: string) => updateField("longitude", v)}
              />
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-gray-700">
                  Allowed Radius (max 200 Meter) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1D6BA3]/10 focus:border-[#1D6BA3]"
                    value={formData.radius}
                    onChange={(e) => updateField("radius", e.target.value)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col scale-75">
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronDown className="rotate-180" size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button className="text-[13px] font-bold text-[#1D6BA3] hover:underline">
              See Location On Map
            </button>
          </div>
        </Card>

        <div className="bg-white rounded-xl px-5 py-3.5 shadow-sm border border-gray-200 flex justify-end gap-3 mt-4">
          <Button
            variant="ghost"
            className="border border-[#1D6BA3] text-[#1D6BA3] hover:bg-[#1D6BA3]/5 h-10 px-8 rounded-lg font-bold"
            onClick={() => setSearchParams({})}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-[#1D6BA3] hover:bg-[#1D6BA3]/90 h-10 px-10 rounded-lg font-bold shadow-lg shadow-[#1D6BA3]/20 disabled:opacity-50"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={isSaveSuccessOpen}
        onClose={() => setIsSaveSuccessOpen(false)}
        title="Save"
        size="md"
      >
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#83D152] flex items-center justify-center mb-6 shadow-lg shadow-[#83D152]/20">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-[20px] font-bold text-gray-800">
            {isEditing ? "Branch Edited Successfully" : "Branch Created Successfully"}
          </p>
          <div className="h-4"></div>
          <Button
            variant="primary"
            className="bg-[#1D6BA3] px-10 font-bold h-10 rounded-lg hidden"
            onClick={() => {
              setIsSaveSuccessOpen(false);
              setSearchParams({});
            }}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageInstitutions;
