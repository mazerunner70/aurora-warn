import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  apiUrl: process.env.VITE_API_URL || '',
};

if (!config.apiUrl) {
  console.warn('API URL is not configured');
}

export default config; 