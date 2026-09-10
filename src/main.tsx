import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingProvider } from './context/LoadingContext';
import { GlobalLoadingScreen } from './components/common/GlobalLoadingScreen';
import './index.css';

// Safely suppress benign Vite HMR websocket disconnection warnings in cloud sandbox
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (reasonStr.toLowerCase().includes('websocket') || reasonStr.includes('vite')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LoadingProvider>
        <GlobalLoadingScreen />
        <App />
      </LoadingProvider>
    </ErrorBoundary>
  </StrictMode>,
);


