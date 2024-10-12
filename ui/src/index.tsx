import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // Import the App component

const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.render(<App />, rootElement); // Render the App component into the root element
}
