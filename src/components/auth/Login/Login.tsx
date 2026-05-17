import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { assets } from "../../../assets/assets.ts";

const HARDCODED_OTP        = "123456";
const TEST_MOBILE          = "8936236865";       // Regular admin → /layout
const DEV_SUPER_ADMIN_MOBILE = "9715598852";     // Super admin → /super-admin

// ── Helpers ────────────────────────────────────────────────────────────────────
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isMobile = (value: string) => /^\d{10}$/.test(value);

type InputType = "mobile" | "email" | "unknown";

const detectInputType = (value: string): InputType => {
  if (isMobile(value)) return "mobile";
  if (isEmail(value)) return "email";
  return "unknown";
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const EyeOnIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

const LoginArrowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.2}
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
    />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  // Get auth methods
  const { requestOtp, verifyOtp, isLoading, useApi, setUseApi } = useAuth();
  const navigate = useNavigate();

  const phoneImage = assets.login_img;

  // Detect what the user typed
  const inputType: InputType = detectInputType(identifier.trim());

  // ── Identifier input handler — only allow digits if it looks like mobile ──
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If user hasn't typed '@' yet and all chars are digits, enforce numeric only
    if (!val.includes("@") && /^\d*$/.test(val)) {
      if (val.length <= 10) setIdentifier(val);
    } else {
      setIdentifier(val);
    }
    setError("");
  };

  // ── Send OTP handler ─────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setError("");
    const val = identifier.trim();
    
    if (!val) {
      setError("Please enter your mobile number or email address");
      return;
    }
    
    if (!isMobile(val) && !isEmail(val)) {
      setError(
        val.includes("@")
          ? "Please enter a valid email address"
          : "Please enter a valid 10-digit mobile number"
      );
      return;
    }

    try {
      if (useApi) {
        await requestOtp(val);
      }
      setIsOtpSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    }
  };

  // ── Login handler — verify OTP ───────────────────────────────────────────
  const validate = () => {
    setError("");
    
    if (!otp) {
      setError("Please enter the OTP");
      return false;
    }
    
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return false;
    }
    return true;
  };

  // ── Login handler — DEV BYPASS active; swap in API block for production ────
  const handleLogin = async () => {
    setError("");
    if (!validate()) return;

    const identifierTrimmed = identifier.trim();

    if (useApi) {
      try {
        await verifyOtp(identifierTrimmed, otp);
        navigate("/layout");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      }
    } else {
      /* DEV BYPASS ────────────────────────────────────────────────────────────── */
      if (identifierTrimmed === DEV_SUPER_ADMIN_MOBILE && otp === HARDCODED_OTP) {
        navigate("/super-admin");
        return;
      }
      if (identifierTrimmed === TEST_MOBILE && otp === HARDCODED_OTP) {
        navigate("/layout");
        return;
      }
      setError("Invalid credentials. Use the test credentials below.");
    }
  };

  // ── Autofill credentials ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0d3a5c] via-[#1D6BA3] to-[#1a8fa0] px-4">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-60px] w-[500px] h-[500px] bg-[#1D6BA3]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Left side — app showcase */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8">
        <div className="max-w-3xl relative">
          <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl scale-90" />
          <img
            src={phoneImage}
            alt="CollabOn app showcase"
            className="relative w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Right side — Login card */}
      <div className="w-full max-w-md relative">
        <div className="bg-white shadow-2xl rounded-3xl px-10 py-10 border border-white/60">
          {/* Logo mark */}
          <div className="flex justify-center mb-5">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#2d7d6f] rounded-full shadow-lg" />
              <div className="w-12 h-12 bg-[#2d7d6f] rounded-full -ml-5 shadow-lg opacity-80" />
            </div>
          </div>

          {/* Brand name */}
          <h1 className="text-3xl font-bold text-center text-gray-900 tracking-tight mb-1">
            CollabOn
          </h1>
          <p className="text-sm text-gray-400 text-center mb-8">Please Log-in to your account</p>

          {/* ── Identifier field ── */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              {inputType === "email" ? "Email Address" : "Mobile Number"}
            </label>
            <div className="relative group">
              {/* Dynamic left icon */}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2d7d6f] transition-colors">
                {inputType === "email" ? <EmailIcon /> : <PhoneIcon />}
              </div>
              <input
                id="login-identifier"
                type={inputType === "email" ? "email" : "tel"}
                value={identifier}
                onChange={handleIdentifierChange}
                disabled={isLoading}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d7d6f]/30 focus:border-[#2d7d6f] disabled:opacity-60 transition-all"
              />
            </div>
            {/* Subtle hint when user types enough to determine type */}
            {identifier.length > 0 && inputType === "unknown" && (
              <p className="mt-1.5 text-xs text-amber-500 font-medium">
                Enter a 10-digit mobile number or a valid email
              </p>
            )}
          </div>

          {/* ── OTP field (only shown after Send OTP) ── */}
          {isOtpSent && (
            <div className="mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-bold text-gray-800 mb-2">OTP</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2d7d6f] transition-colors">
                  <LockIcon />
                </div>
                <input
                  id="login-otp"
                  type={showOtp ? "text" : "password"}
                  value={otp}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 6) setOtp(v);
                    setError("");
                  }}
                  disabled={isLoading}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d7d6f]/30 focus:border-[#2d7d6f] disabled:opacity-60 transition-all"
                />
                <button
                  type="button"
                  id="toggle-otp-visibility"
                  onClick={() => setShowOtp(!showOtp)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#2d7d6f] transition-colors"
                >
                  {showOtp ? <EyeOnIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <svg
                className="w-4 h-4 text-red-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* ── Remember me + Forgot password ── */}
          <div className="flex items-center justify-between mb-7">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                  rememberMe
                    ? "bg-[#2d7d6f] border-[#2d7d6f]"
                    : "border-gray-300 group-hover:border-[#2d7d6f]"
                }`}
              >
                {rememberMe && (
                  <svg
                    className="w-3 h-3 text-white"
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
                )}
              </div>
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                Remember me
              </span>
            </label>
            <button
              id="forgot-password"
              type="button"
              className="text-sm font-semibold text-[#2d7d6f] hover:text-[#1a5c54] transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* ── Action buttons ── */}
          {!isOtpSent ? (
            <button
              id="send-otp-button"
              onClick={handleSendOtp}
              disabled={isLoading}
              className="w-full bg-[#2d7d6f] hover:bg-[#245f54] active:scale-[0.98] text-white py-4 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 mb-6 shadow-lg shadow-[#2d7d6f]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  SEND OTP
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <button
              id="login-submit"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-[#2d7d6f] hover:bg-[#245f54] active:scale-[0.98] text-white py-4 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 mb-6 shadow-lg shadow-[#2d7d6f]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  LOGIN
                  <LoginArrowIcon />
                </>
              )}
            </button>
          )}

          {/* ── Test Credentials Helper ── */}
          {!useApi && (
            <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 animate-in fade-in slide-in-from-top-2 duration-500">
              <h3 className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test Credentials
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[9px] text-amber-600 font-medium uppercase">Admin Mobile</p>
                  <p className="text-xs font-bold text-amber-900 tabular-nums">{TEST_MOBILE}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-amber-600 font-medium uppercase">Super Admin</p>
                  <p className="text-xs font-bold text-amber-900 tabular-nums">{DEV_SUPER_ADMIN_MOBILE}</p>
                </div>
                <div className="space-y-1 col-span-2 pt-1 border-t border-amber-200/50">
                  <p className="text-[9px] text-amber-600 font-medium uppercase">Test OTP</p>
                  <p className="text-xs font-bold text-amber-900 tracking-[0.2em]">{HARDCODED_OTP}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── API Mode Toggle ── */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Production API
              </span>
              <span className="text-[10px] text-gray-400">
                {useApi ? "Using live backend" : "Using test credentials"}
              </span>
            </div>
            <button
              onClick={() => setUseApi(!useApi)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                useApi ? "bg-[#2d7d6f]" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useApi ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>


        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6 font-medium tracking-wide">
          © 2025 CollabOn · Empowering institutions
        </p>
      </div>
    </div>
  );
};

export default Login;
