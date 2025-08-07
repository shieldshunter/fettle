// API Configuration for different environments
export const API_CONFIG = {
  // API Base URL - will be different for dev vs production
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // Environment detection
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Get the current environment
  getEnvironment() {
    return import.meta.env.MODE;
  },
  
  // Get the full API URL for a specific endpoint
  getApiUrl(endpoint: string): string {
    const baseUrl = this.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
    return `${baseUrl}/${cleanEndpoint}`;
  }
};

// Log the current configuration (only in development)
if (API_CONFIG.IS_DEVELOPMENT) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    environment: API_CONFIG.getEnvironment(),
    mode: import.meta.env.MODE
  });
} 