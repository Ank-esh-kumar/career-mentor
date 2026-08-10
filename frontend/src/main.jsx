import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import App from './App';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <SubscriptionProvider>
            <ThemeProvider>
              <NotificationProvider>
                <App />
                <Toaster
                position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1E293B',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#22C55E', secondary: '#F8FAFC' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' },
                },
              }}
            />
              </NotificationProvider>
            </ThemeProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
