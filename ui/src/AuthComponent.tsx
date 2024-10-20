import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';


const AuthComponent: React.FC = () => {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1>Hello {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
          <button onClick={async () => {
            console.log('Current user details:', user);
          }}>
            Get Current User
          </button>
        </div>
      )}
    </Authenticator>
  );
};

export default AuthComponent;
