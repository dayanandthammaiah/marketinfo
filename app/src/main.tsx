import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppMaterial } from './AppMaterial';
import './index.css';

// Use Material-UI version for modern design
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppMaterial />
  </StrictMode>
);
