import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import apiClient from '../services/api';
import { useCart } from '../context/CartContext';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/productos/${id}/`)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar el producto:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" gutterBottom>Producto no encontrado</Typography>
        <Button 
          component={RouterLink} 
          to="/"
          startIcon={<ArrowBackIcon />}
          variant="contained"
        >
          Volver a Inicio
        </Button>
      </Box>
    );
  }

  const stock = product.stock ?? 0;
  const isOutOfStock = stock === 0;

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      {/* Botón Volver */}
      <Button 
        component={RouterLink} 
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: '#667eea', fontWeight: 600 }}
      >
        Volver a productos
      </Button>

      <Grid container spacing={4}>
        {/* Columna de la Imagen */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
          >
            <Box
              component="img"
              sx={{
                width: '100%',
                height: { xs: 300, md: 500 },
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              alt={product.nombre}
              src={product.imagen_url || 'https://via.placeholder.com/600x400'}
            />
            {isOutOfStock && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  AGOTADO
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Columna de la Información */}
        <Grid item xs={12} md={7}>
          {/* Título y Stock */}
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 700, color: '#333', mb: 1 }}
            >
              {product.nombre}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={stock > 0 ? `${stock} disponibles` : 'Sin stock'}
                color={stock > 0 ? 'success' : 'error'}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
              {stock > 0 && stock <= 5 && (
                <Chip 
                  label="Stock Limitado"
                  color="warning"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>
          </Box>

          {/* Precio */}
          <Box sx={{ mb: 3, pb: 3, borderBottom: '2px solid #eee' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Precio:
            </Typography>
            <Typography 
              variant="h2"
              sx={{ 
                color: '#667eea', 
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3rem' }
              }}
            >
              S/ {Number(product.precio).toFixed(2)}
            </Typography>
          </Box>

          {/* Descripción */}
          <Box sx={{ mb: 3, pb: 3, borderBottom: '2px solid #eee' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
              Descripción del Producto
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {product.descripcion || 'No hay descripción disponible para este producto.'}
            </Typography>
          </Box>

          {/* Botón Añadir al Carrito */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={isOutOfStock ? 'outlined' : 'contained'}
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              sx={{
                flex: 1,
                background: isOutOfStock ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: isOutOfStock ? '#999' : 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                letterSpacing: 1,
                py: 1.8,
                '&:hover': {
                  boxShadow: isOutOfStock ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.4)'
                }
              }}
            >
              {isOutOfStock ? 'No Disponible' : 'Añadir al Carrito'}
            </Button>
          </Box>

          {/* Info Adicional */}
          <Box sx={{ p: 2, backgroundColor: '#f5f7ff', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ✓ Envío rápido y seguro
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ✓ Garantía de satisfacción
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ✓ Compra con confianza
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetail;