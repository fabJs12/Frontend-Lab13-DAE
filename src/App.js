import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';

// Importa las páginas
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';

// Componentes de Layout de MUI
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

function App() {
  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}
    >
      <Navbar />
      <Container 
        maxWidth="lg"
        sx={{
          flex: 1,
          py: { xs: 2, md: 4 }
        }}
      >
        <Routes>
          {/* Requisito: Vista Home (listar todos los productos) */}
          <Route path="/" element={<Home />} />
          
          {/* Requisito: Vista DetalleProducto */}
          <Route path="/producto/:id" element={<ProductDetail />} />
          
          {/* Requisito: Vista "Carrito" */}
          <Route path="/carrito" element={<Cart />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;