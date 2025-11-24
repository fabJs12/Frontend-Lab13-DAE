import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

const ProductCard = ({ product }) => {
  const nombre = product.nombre || product.name || 'Sin nombre';
  const precio = product.precio ?? product.price ?? 0;
  const imagen = product.imagen_url || product.image || 'https://via.placeholder.com/300x200';
  const id = product.id ?? product.pk;
  const stock = product.stock ?? 0;

  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock === 0;

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
        },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isOutOfStock && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            backdropFilter: 'blur(2px)'
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
            AGOTADO
          </Typography>
        </Box>
      )}

      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="220"
          image={imagen}
          alt={nombre}
          sx={{
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />
        {isLowStock && (
          <Chip
            label={`Solo ${stock} disponibles`}
            color="warning"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontWeight: 600,
              backgroundColor: '#ff9800',
              color: 'white'
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="h2"
          sx={{
            fontWeight: 600,
            color: '#333',
            minHeight: '2.5em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {nombre}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#667eea', 
              fontWeight: 700,
              fontSize: '1.5rem'
            }}
          >
            S/ {Number(precio).toFixed(2)}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: stock > 0 ? '#4caf50' : '#f44336',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            {stock > 0 ? `${stock} en stock` : 'Sin stock'}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ pt: 0 }}>
        <Button
          fullWidth
          size="medium"
          variant={isOutOfStock ? 'outlined' : 'contained'}
          component={RouterLink}
          to={id ? `/producto/${id}` : '#'}
          disabled={isOutOfStock}
          sx={{
            background: isOutOfStock ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: isOutOfStock ? '#999' : 'white',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            '&:hover': {
              boxShadow: isOutOfStock ? 'none' : '0 6px 12px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          {isOutOfStock ? 'No disponible' : 'Ver Detalle'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;