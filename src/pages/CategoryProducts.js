import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useCategoryProducts, useCategories, usePrefetchProductDetail } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const { data: products = [], isLoading, error } = useCategoryProducts(categoryId);
  const { data: categories = [] } = useCategories();
  const prefetchProductDetail = usePrefetchProductDetail();

  const currentCategory = categories.find(cat => cat.id === parseInt(categoryId));

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error">
          Error al cargar productos: {error.message}
        </Alert>
        <Button 
          component={RouterLink} 
          to="/categorias"
          startIcon={<ArrowBackIcon />}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Volver a Categorías
        </Button>
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom color="text.secondary">
          No hay productos en esta categoría
        </Typography>
        <Button 
          component={RouterLink} 
          to="/categorias"
          startIcon={<ArrowBackIcon />}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Volver a Categorías
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Button 
        component={RouterLink} 
        to="/categorias"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: '#667eea', fontWeight: 600 }}
      >
        Volver a Categorías
      </Button>

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography 
          variant="h4" 
          component="h1"
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
          {currentCategory?.nombre || 'Productos'}
        </Typography>
        <Typography variant="body1" sx={{ color: '#999', fontStyle: 'italic' }}>
          ({products.length} productos)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            lg={3} 
            key={product.id}
            onMouseEnter={() => prefetchProductDetail(product.id)}
          >
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryProducts;
