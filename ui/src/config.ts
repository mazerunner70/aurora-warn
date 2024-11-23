export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
};

if (!config.apiUrl) {
  console.warn('API URL is not configured');
}

export default config; 