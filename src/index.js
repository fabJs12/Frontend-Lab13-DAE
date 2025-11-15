import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

// Importa los estilos base de Material-UI
import CssBaseline from '@mui/material/CssBaseline';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <CssBaseline /> { /* Resetea los estilos CSS por defecto */ }
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);