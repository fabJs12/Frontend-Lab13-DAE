import React, { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useProductDetail, useAddToCart } from '../hooks/useQueries';
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
import Alert from '@mui/material/Alert';

const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, isLoading, error } = useProductDetail(id);
  const addToCartMutation = useAddToCart();
  const { addToCart } = useCart(); // para actualizar contexto local
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error">Error al cargar el producto</Alert>
        <Button 
          component={RouterLink} 
          to="/"
          startIcon={<ArrowBackIcon />}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Volver a Inicio
        </Button>
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
  const precio = product.precio ?? product.price ?? 0;
  const imagen = product.imagen_url || product.image || 'https://via.placeholder.com/600x400';
  const nombre = product.nombre || product.name || 'Sin nombre';

  const handleAddToCart = () => {
    // Optimistic update en React Query
    addToCartMutation.mutate(
      { productId: parseInt(id), quantity },
      {
        onSuccess: () => {
          // También actualizar el contexto local
          for (let i = 0; i < quantity; i++) {
            addToCart(product);
          }
          setMessage(`✓ ${nombre} añadido al carrito`);
          setTimeout(() => setMessage(''), 3000);
          setQuantity(1);
        },
      }
    );
  };

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

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

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
              alt={nombre}
              src={imagen}
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
              {nombre}
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
              S/ {Number(precio).toFixed(2)}
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

          {/* Controles de cantidad */}
          <Box sx={{ mb: 3, pb: 3, borderBottom: '2px solid #eee' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
              Cantidad
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity === 1 || isOutOfStock}
                sx={{ minWidth: 40 }}
              >
                −
              </Button>
              <Typography sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600, fontSize: '1.2rem' }}>
                {quantity}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                disabled={quantity >= stock || isOutOfStock}
                sx={{ minWidth: 40 }}
              >
                +
              </Button>
            </Box>
          </Box>

          {/* Botón Añadir al Carrito */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={isOutOfStock ? 'outlined' : 'contained'}
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCartMutation.isPending}
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
              {addToCartMutation.isPending ? 'Agregando...' : isOutOfStock ? 'No Disponible' : 'Añadir al Carrito'}
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