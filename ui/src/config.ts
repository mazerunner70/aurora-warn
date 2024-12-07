interface Config {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId: string;
  cloudfrontUrl: string;
}

const config: Config = {
  region: import.meta.env.VITE_REGION || 'eu-west-2',
  userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
  userPoolWebClientId: import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID || '',
  identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || '',
  cloudfrontUrl: import.meta.env.VITE_CLOUDFRONT_URL || '',
};

export default config; 