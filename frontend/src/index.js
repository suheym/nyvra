import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

function ConfigurationError() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f7f7fb' }}>
      <section style={{ maxWidth: '430px', width: '100%', background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '28px', marginBottom: '12px' }}>🌿</div>
        <h1 style={{ margin: '0 0 8px', fontSize: '22px', color: '#1a1a1a' }}>Nyvra needs authentication setup</h1>
        <p style={{ margin: '0 0 14px', color: '#666', lineHeight: 1.6, fontSize: '14px' }}>
          Add your Clerk publishable key as <strong>REACT_APP_CLERK_PUBLISHABLE_KEY</strong> before using the app.
        </p>
        <p style={{ margin: 0, color: '#888', lineHeight: 1.6, fontSize: '13px' }}>
          This is a configuration requirement, not an application error.
        </p>
      </section>
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey}>
        <App />
      </ClerkProvider>
    ) : (
      <ConfigurationError />
    )}
  </React.StrictMode>
);

reportWebVitals();
