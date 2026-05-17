/**
 * Environment Configuration
 * Centralized access to environment variables
 */

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/",
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  appEnv: import.meta.env.VITE_APP_ENV || "development",
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === "true",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

export default env;
