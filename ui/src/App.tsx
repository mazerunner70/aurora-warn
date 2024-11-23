import React from 'react';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import AuthComponent from './AuthComponent';

Amplify.configure(awsconfig);

const App: React.FC = () => {
  return (
    <div className="App">h
      <AuthComponent />
    </div>
  );
};

export default App;
