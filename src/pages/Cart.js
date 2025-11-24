import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useCart, useIncreaseQuantity, useDecreaseQuantity, useRemoveFromCart } from '../hooks/useQueries';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const Cart = () => {
  const { data: cartData, isLoading: cartLoading, error: cartError } = useCart();
  const removeMutation = useRemoveFromCart();
  const increaseQuantity = useIncreaseQuantity();
  const decreaseQuantity = useDecreaseQuantity();

  const cartItems = cartData?.items || [];

  const total = cartItems.reduce((acc, item) => {
    const precio = item.producto_precio || item.precio || 0;
    const cantidad = item.cantidad || 0;
    return acc + (Number(precio) * cantidad);
  }, 0);

  if (cartLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (cartError) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error">
          Error al cargar el carrito: {cartError.message}
        </Alert>
        <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
          Volver a Inicio
        </Button>
      </Box>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ShoppingCartIcon sx={{ fontSize: 80, color: '#ddd', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#333' }}>
          Tu carrito está vacío
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Aún no has añadido ningún juego a tu carrito
        </Typography>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/"
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}
        >
          Explorar Productos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom
        sx={{ fontWeight: 700, color: '#333', mb: 4 }}
      >
        Tu Carrito de Compras
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          >
            <List sx={{ p: 0 }}>
              {cartItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 2,
                      backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                      alignItems: 'flex-start'
                    }}
                  >
                    <ListItemAvatar sx={{ mr: 2, minWidth: 'auto' }}>
                      <Avatar
                        variant="rounded"
                        src={item.producto_imagen || item.imagen_url || 'https://via.placeholder.com/100'}
                        alt={item.producto_nombre || item.nombre}
                        sx={{ width: 100, height: 100 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                          {item.producto_nombre || item.nombre}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Precio unitario: <span style={{ fontWeight: 600, color: '#667eea' }}>
                              S/ {Number(item.producto_precio || item.precio).toFixed(2)}
                            </span>
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 1, fontWeight: 700, color: '#764ba2' }}>
                            Subtotal: S/ {(item.cantidad * Number(item.producto_precio || item.precio)).toFixed(2)}
                          </Typography>
                        </Box>
                      }
                      sx={{ flex: 1 }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => decreaseQuantity.mutate(item.id, item.cantidad)}
                        disabled={decreaseQuantity.isPending || item.cantidad === 1}
                        sx={{ color: '#667eea' }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 600 }}>
                        {item.cantidad}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => increaseQuantity.mutate(item.id, item.cantidad)}
                        disabled={increaseQuantity.isPending}
                        sx={{ color: '#667eea' }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <Divider orientation="vertical" variant="middle" flexItem />
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => removeMutation.mutate(item.id)}
                        disabled={removeMutation.isPending}
                        sx={{
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < cartItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
              position: 'sticky',
              top: 20
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Resumen de Compra
            </Typography>
            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.3)', mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body1">Artículos:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {cartItems.reduce((sum, item) => sum + item.cantidad, 0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  S/ {total.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body1">Envío:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Gratis</Typography>
              </Box>
            </Box>

            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.3)', my: 2 }} />

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Total:
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '2rem' }}>
                S/ {total.toFixed(2)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: '#667eea',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 1.5,
                '&:hover': {
                  backgroundColor: '#f0f0f0'
                }
              }}
            >
              Proceder al Pago
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/"
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white'
                }
              }}
            >
              Seguir Comprando
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Cart;