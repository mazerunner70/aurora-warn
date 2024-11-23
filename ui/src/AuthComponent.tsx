import React, { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Graph from './Graph';
import { fetchAuroraData } from './services/AuroraService';
import { fetchAuthSession } from 'aws-amplify/auth';

interface AuroraEntry {
  epochtime: number;
  statusId: string;
  value: number;
}

const AuthComponent: React.FC = () => {
  const [auroraData, setAuroraData] = useState<AuroraEntry[]>([]);
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.payload?.sub;
      if (!token) {
        throw new Error('No token found');
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

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
            <h1>Hello {user?.username}</h1>
            <div>
              <button 
                onClick={fetchData} 
                style={{ marginRight: '1rem' }}
              >
                Refresh Data
              </button>
              <button onClick={signOut}>Sign out</button>
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
      )}
    </Authenticator>
  );
};

export default AuthComponent;
