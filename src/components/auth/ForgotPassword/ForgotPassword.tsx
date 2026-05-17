import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../../assets/assets.ts";

const ForgotPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!emailOrPhone) {
      alert("Please enter your email address or phone number");
      return;
    }

    try {
      // TODO: Call API to send OTP/reset link
      // await authService.forgotPassword({ emailOrPhone });
      navigate("/otp");
    } catch {
      alert("Failed to send OTP. Please try again.");
    }
  };

  const forgot_password = assets.forgot_password;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8">
        <div className="max-w-2xl">
          <img
            src={forgot_password}
            alt="Forgot password illustration"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Right side - Forgot Password form */}
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-12">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center gap-1">
            <div className="w-10 h-10 bg-teal-700 rounded-full"></div>
            <div className="w-10 h-10 bg-teal-700 rounded-full -ml-5"></div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-2">CollabOn</h1>

        {/* Subtitle */}
        <p className="text-sm text-gray-600 text-center mb-10">
          Please Enter Email Address Or Phone Number
          <br />
          Associated With Your Account
        </p>

        {/* Email/Phone Field */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email ID / Mobile Number
          </label>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter your email or phone number"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-gray-200 text-gray-400 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
