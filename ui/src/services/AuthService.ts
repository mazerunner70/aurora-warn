import { CognitoUser, AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js';
import config from '../aws-exports';

interface AuthResult {
  token: string;
  error?: string;
}

class AuthService {
  private userPool: CognitoUserPool;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: config.aws_user_pools_id,
      ClientId: config.aws_user_pools_web_client_id,
    });
  }

  async signIn(username: string, password: string): Promise<AuthResult> {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: this.userPool,
    });

    try {
      const result = await new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => resolve(result),
          onFailure: (err) => reject(err),
        });
      });

      // @ts-ignore - result type is complex
      const token = result.getAccessToken().getJwtToken();
      return { token };
    } catch (err) {
      console.error('Error signing in:', err);
      return { token: '', error: 'Failed to sign in. Please check your credentials.' };
    }
  }

  signOut() {
    const cognitoUser = this.userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  }

  getCurrentUser() {
    return this.userPool.getCurrentUser();
  }
}

export const authService = new AuthService(); 