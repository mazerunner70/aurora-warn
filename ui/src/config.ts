import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  cloudFrontUrl: import.meta.env.VITE_CLOUDFRONT_URL || '',
};

if (!config.cloudFrontUrl) {
  console.warn('CloudFront URL is not configured');
}

export default config; 