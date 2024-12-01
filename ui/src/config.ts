import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  apiUrl: process.env.VITE_API_URL || '',
  cloudFrontUrl: process.env.VITE_CLOUDFRONT_URL || '',
};

if (!config.cloudFrontUrl) {
  console.warn('CloudFront URL is not configured');
}

export default config; 