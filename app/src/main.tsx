import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { IonApp } from '@ionic/react';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { AlertsProvider } from './contexts/AlertsContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import App from './App';
import './index.css';
import '@ionic/react/css/core.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IonApp>
      <FavoritesProvider>
        <AlertsProvider>
          <PortfolioProvider>
            <App />
          </PortfolioProvider>
        </AlertsProvider>
      </FavoritesProvider>
    </IonApp>
  </StrictMode>
);
