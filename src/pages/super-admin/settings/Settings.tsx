import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button/Button";

const SuperAdminSettings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [userDetails, setUserDetails] = useState({
    name: "",
    mobile: "",
    email: "",
  });

  const [passwordDetails, setPasswordDetails] = useState({
    password: "",
    confirm: "",
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">User Settings</h1>
      </div>

      {/* User Details Section */}
      <Card className="border-gray-100 shadow-sm overflow-visible">
        <div className="px-1 py-1">
          <h2 className="text-[15px] font-bold text-gray-900 mb-6">User Details</h2>

          <div className="flex flex-col lg:flex-row items-end gap-4">
            {/* Name */}
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Full name"
                value={userDetails.name}
                onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Mobile Number */}
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="+91"
                value={userDetails.mobile}
                onChange={(e) => setUserDetails({ ...userDetails, mobile: e.target.value })}
                className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Email ID */}
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">
                Email ID (Official) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="@gmail"
                value={userDetails.email}
                onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 lg:pt-0">
              <Button
                variant="outline"
                className="px-6 h-11 text-[14px] font-bold"
                onClick={() => setUserDetails({ name: "", mobile: "", email: "" })}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="px-8 h-11 text-[14px] font-bold bg-[#1D6BA3] shadow-md shadow-blue-100"
                onClick={() => console.log("Saving user details...", userDetails)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Password Details Section */}
      <Card className="border-gray-100 shadow-sm overflow-visible">
        <div className="px-1 py-1">
          <h2 className="text-[15px] font-bold text-gray-900 mb-6">Password Details</h2>

          <div className="flex flex-col lg:flex-row items-start gap-4">
            {/* Password */}
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter"
                  value={passwordDetails.password}
                  onChange={(e) =>
                    setPasswordDetails({ ...passwordDetails, password: e.target.value })
                  }
                  className="w-full h-11 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[11px] text-[#7D7D7D] font-bold">
                Password should be a least 5 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">
                Confirm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter"
                  value={passwordDetails.confirm}
                  onChange={(e) =>
                    setPasswordDetails({ ...passwordDetails, confirm: e.target.value })
                  }
                  className="w-full h-11 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[11px] text-[#7D7D7D] font-bold">
                Please re-enter your password to confirm.
              </p>
            </div>

            {/* Change Password Button */}
            <div className="pt-6">
              <Button
                variant="primary"
                className="px-8 h-11 text-[14px] font-bold bg-[#1D6BA3] shadow-md shadow-blue-100"
                onClick={() => console.log("Changing password...", passwordDetails)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminSettings;
