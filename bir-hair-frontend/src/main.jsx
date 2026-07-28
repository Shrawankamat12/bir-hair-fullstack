import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <CompareProvider>
          <App />
        </CompareProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>
);
