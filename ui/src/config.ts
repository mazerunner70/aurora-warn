import dotenv from 'dotenv';

dotenv.config();

interface Config {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId: string;
  cloudfrontUrl: string;
}

const config: Config = {
  region: process.env.VITE_REGION || 'eu-west-2',
  userPoolId: process.env.VITE_USER_POOL_ID || '',
  userPoolWebClientId: process.env.VITE_USER_POOL_WEB_CLIENT_ID || '',
  identityPoolId: process.env.VITE_IDENTITY_POOL_ID || '',
  cloudfrontUrl: process.env.VITE_CLOUDFRONT_URL || '',
};

export default config; 