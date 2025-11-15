import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import ProductCard from '../components/ProductCard';

// Componentes de MUI
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/productos/')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar productos:", error);
        setLoading(false);
      });
  }, []); 

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 4, md: 6 },
          mb: 6,
          borderRadius: 2,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, letterSpacing: 2 }}>
            🎲 BIENVENIDO A LUDOTECA 🎲
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: 1 }}>
            Descubre la mejor colección de juegos de mesa
          </Typography>
        </Box>
      </Box>

      {/* Título de Productos */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography 
          variant="h4" 
          component="h2"
          sx={{ 
            fontWeight: 700, 
            color: '#333',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: 60,
              height: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2
            }
          }}
        >
          Nuestros Productos
        </Typography>
        <Typography variant="body1" sx={{ color: '#999', fontStyle: 'italic' }}>
          ({products.length} juegos disponibles)
        </Typography>
      </Box>

      {/* Grid de Productos */}
      {products.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            No hay productos disponibles en este momento
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Home;