interface Config {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId: string;
  cloudfrontUrl: string;
}

const config: Config = {
  region: process.env.AWS_REGION || 'eu-west-2',
  userPoolId: process.env.USER_POOL_ID || '',
  userPoolWebClientId: process.env.APP_CLIENT_ID || '',
  identityPoolId: process.env.IDENTITY_POOL_ID || '',
  cloudfrontUrl: process.env.CLOUDFRONT_URL || '',
};

export default config; 