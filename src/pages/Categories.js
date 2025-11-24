import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useCategories, usePrefetchCategoryProducts } from '../hooks/useQueries';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const Categories = () => {
  const { data: categories = [], isLoading, error } = useCategories();
  const prefetchProducts = usePrefetchCategoryProducts();

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
          Error al cargar categorías: {error.message}
        </Alert>
      </Box>
    );
  }

  if (categories.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">
          No hay categorías disponibles
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
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
            📚 CATEGORÍAS DE JUEGOS 📚
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: 1 }}>
            Descubre juegos por categoría y encuentra tu favorito
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
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
                cursor: 'pointer',
                borderRadius: 2,
              }}
              onMouseEnter={() => prefetchProducts(category.id)}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  py: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  minHeight: 200,
                }}
              >
                {getCategoryIcon(category.nombre)}
              </Box>

              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: '#333',
                    mb: 1,
                  }}
                >
                  {category.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {category.descripcion || 'Descubre los mejores juegos de esta categoría'}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  component={RouterLink}
                  to={`/categoria/${category.id}`}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    '&:hover': {
                      boxShadow: '0 6px 12px rgba(102, 126, 234, 0.4)',
                    },
                  }}
                >
                  Ver Juegos
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

function getCategoryIcon(categoryName) {
  const name = categoryName.toLowerCase();
  
  if (name.includes('estrategia')) return '♟️';
  if (name.includes('rol')) return '🎲';
  if (name.includes('cooperativ')) return '🤝';
  if (name.includes('party') || name.includes('fiesta')) return '🎉';
  if (name.includes('infantil') || name.includes('niños')) return '👶';
  if (name.includes('aventura')) return '🗺️';
  if (name.includes('puzzle')) return '🧩';
  if (name.includes('cartas')) return '🃏';
  
  return '🎮';
}

export default Categories;
