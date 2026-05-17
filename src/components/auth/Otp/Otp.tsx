import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../../assets/assets.ts";

const Otp = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState<number>(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const phoneImage = assets.otp;
  const navigate = useNavigate();

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char: string, index: number) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleResendOtp = async () => {
    if (timer === 0) {
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      // TODO: Call API to resend OTP
      // await authService.resendOtp();
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      alert("Please enter complete OTP");
      return;
    }

    try {
      // TODO: Verify OTP with backend API
      // await authService.verifyOtp(otpValue);
      navigate("/reset-password");
    } catch {
      alert("Invalid OTP. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8">
        <div className="max-w-2xl">
          <img
            src={phoneImage} // Replace with: assets.otp_img or import path
            alt="OTP verification illustration"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Right side - OTP form */}
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-12">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center gap-1">
            <div className="w-10 h-10 bg-teal-700 rounded-full"></div>
            <div className="w-10 h-10 bg-teal-700 rounded-full -ml-5"></div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">CollabOn</h1>

        {/* Message */}
        <p className="text-sm text-gray-600 text-center mb-2">
          OTP has been sent to your registered number
        </p>
        <p className="text-sm text-teal-700 text-center mb-8 font-medium">+91 XXXX XXXX XX</p>

        {/* OTP Input Fields */}
        <div className="flex gap-3 justify-center mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-14 h-14 text-center text-xl font-semibold bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          ))}
        </div>

        {/* Resend OTP */}
        <div className="text-center mb-8">
          {timer > 0 ? (
            <p className="text-sm text-gray-500">
              Resend OTP in <span className="font-medium text-gray-700">{formatTime(timer)}</span>
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              className="text-sm text-teal-700 font-medium hover:text-teal-800 underline"
            >
              Resend OTP
            </button>
          )}
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

export default Otp;
