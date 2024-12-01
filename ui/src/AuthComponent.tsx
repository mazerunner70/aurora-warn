import React, { useState } from 'react';
import Graph from './Graph';
import { fetchAuroraData } from './services/AuroraService';
import { authService } from './services/AuthService';

interface AuroraEntry {
  epochtime: number;
  statusId: string;
  value: number;
}

interface RawAuroraEntry {
  epochtime: number;
  statusId: string;
  value: string | number;
}

const AuthComponent: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string>('');
  const [auroraData, setAuroraData] = useState<AuroraEntry[]>([]);
  const [error, setError] = useState<string>('');

  const isNumeric = (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const processAuroraData = (rawData: RawAuroraEntry[]): AuroraEntry[] => {
    return rawData
      .filter(entry => isNumeric(entry.value))
      .map(entry => ({
        epochtime: entry.epochtime,
        statusId: entry.statusId,
        value: parseFloat(entry.value as string)
      }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await authService.signIn(username, password);
    
    if (result.token) {
      setToken(result.token);
      setIsAuthenticated(true);
      setError('');
    } else {
      setError(result.error || 'Authentication failed');
    }
  };

  const handleSignOut = () => {
    authService.signOut();
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
        const processedData = processAuroraData(response.data.auroraEntries);
        console.log('Processed data:', processedData);
        setAuroraData(processedData);
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
