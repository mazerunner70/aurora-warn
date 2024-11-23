import React, { useState } from 'react';
import { CognitoUser, AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js';
import Graph from './Graph';
import { fetchAuroraData } from './services/AuroraService';
import config from './aws-exports';

interface AuroraEntry {
  epochtime: number;
  statusId: string;
  value: number;
}

const userPool = new CognitoUserPool({
  UserPoolId: config.aws_user_pools_id,
  ClientId: config.aws_user_pools_web_client_id,
});

const AuthComponent: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string>('');
  const [auroraData, setAuroraData] = useState<AuroraEntry[]>([]);
  const [error, setError] = useState<string>('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    try {
      const result = await new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => {
            resolve(result);
          },
          onFailure: (err) => {
            reject(err);
          },
        });
      });

      // @ts-ignore - result type is complex
      const idToken = result.getIdToken().getJwtToken();
      setToken(idToken);
      setIsAuthenticated(true);
      setError('');
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Failed to sign in. Please check your credentials.');
    }
  };

  const handleSignOut = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    setIsAuthenticated(false);
    setToken('');
    setAuroraData([]);
  };

  const fetchData = async () => {
    try {
      if (!token) {
        throw new Error('No token available');
      }
      const response = await fetchAuroraData(token);
      
      if (response.data && response.data.auroraEntries) {
        setAuroraData(response.data.auroraEntries);
      }
    } catch (err) {
      console.error('Error fetching aurora data:', err);
      setError('Failed to fetch aurora data');
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
          <h1>Hello {username}</h1>
          <div>
            <button 
              onClick={fetchData} 
              style={{ marginRight: '1rem' }}
            >
              Refresh Data
            </button>
            <button onClick={handleSignOut}>Sign out</button>
          </div>
        </div>

        {error && (
          <div style={{ color: 'red', padding: '1rem' }}>
            {error}
          </div>
        )}

        {auroraData.length > 0 ? (
          <Graph data={auroraData} />
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No data available. Click "Refresh Data" to load aurora data.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignIn}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </label>
        </div>
        <button 
          type="submit"
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default AuthComponent;
