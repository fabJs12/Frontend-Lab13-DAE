import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePrefetchCategoryProducts } from '../hooks/useQueries';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GamesIcon from '@mui/icons-material/Games';

const Navbar = () => {
  const { cartItems } = useCart();
  const prefetchCategoryProducts = usePrefetchCategoryProducts();

  const totalItems = cartItems.reduce((total, item) => total + item.cantidad, 0);

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
        marginBottom: 4
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GamesIcon sx={{ fontSize: 32 }} />
          <Typography 
            variant="h5" 
            component={RouterLink} 
            to="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'white', 
              fontWeight: 700,
              letterSpacing: 1,
              '&:hover': { opacity: 0.9 }
            }}
          >
            LUDOTECA
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            sx={{ fontSize: '1rem', fontWeight: 500, '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
          >
            Inicio
          </Button>
          
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/categorias"
            sx={{ fontSize: '1rem', fontWeight: 500, '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
          >
            Categorías
          </Button>
          
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/carrito"
            aria-label="ver carrito"
            size="large"
            sx={{ 
              position: 'relative',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Badge 
              badgeContent={totalItems} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#ff6b6b',
                  color: '#ff6b6b',
                  boxShadow: '0 0 0 2px white'
                }
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 28 }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;