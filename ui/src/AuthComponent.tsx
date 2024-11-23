import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import Graph from './Graph';

interface AuthComponentProps {
  onSignOut: () => void;
}

const AuthComponent: React.FC<AuthComponentProps> = ({ onSignOut }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Auth.signIn(username, password);
      setIsAuthenticated(true);
      setError('');
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in. Please check your credentials.');
    }
  };

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      setIsAuthenticated(false);
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <button onClick={handleSignOut}>Sign Out</button>
        <Graph />
      </div>
    );
  }

  return (
    <div>
      <h2>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignIn}>
        <div>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default AuthComponent;
