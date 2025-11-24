import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.get('/productos/');
      return response.data;
    },
  });
};

export const useProductDetail = (id) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await apiClient.get(`/productos/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const usePrefetchProductDetail = () => {
  const queryClient = useQueryClient();

  return (productId) => {
    queryClient.prefetchQuery({
      queryKey: ['product', productId],
      queryFn: async () => {
        const response = await apiClient.get(`/productos/${productId}/`);
        return response.data;
      },
    });
  };
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categorias/');
      return response.data;
    },
  });
};

export const useCategoryProducts = (categoryId) => {
  return useQuery({
    queryKey: ['categoryProducts', categoryId],
    queryFn: async () => {
      const response = await apiClient.get(`/categorias/${categoryId}/`);
      const data = response.data;
      return Array.isArray(data) ? data : (data?.productos ?? data?.products ?? []);
    },
    enabled: !!categoryId,
  });
};

export const usePrefetchCategoryProducts = () => {
  const queryClient = useQueryClient();

  return (categoryId) => {
    queryClient.prefetchQuery({
      queryKey: ['categoryProducts', categoryId],
      queryFn: async () => {
        const response = await apiClient.get(`/categorias/${categoryId}/`);
        const data = response.data;
        return Array.isArray(data) ? data : (data?.productos ?? data?.products ?? []);
      },
    });
  };
};

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await apiClient.get('/carrito/');
      return response.data;
    },
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }) => {
      const response = await apiClient.post('/carrito/agregar/', {
        producto_id: productId,
        cantidad: quantity,
      });
      return response.data;
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      const previousCart = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old) => {
        if (!old) return { items: [] };
        
        const existingItem = old.items?.find((item) => item.producto_id === productId);
        
        if (existingItem) {
          return {
            ...old,
            items: old.items.map((item) =>
              item.producto_id === productId
                ? { ...item, cantidad: item.cantidad + quantity }
                : item
            ),
          };
        } else {
          return {
            ...old,
            items: [
              ...(old.items || []),
              { producto_id: productId, cantidad: quantity, id: Date.now() },
            ],
          };
        }
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const response = await apiClient.put(`/carrito/actualizar/${itemId}/`, {
        cantidad: quantity,
      });
      return response.data;
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === itemId ? { ...item, cantidad: quantity } : item
          ),
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId) => {
      await apiClient.delete(`/carrito/eliminar/${itemId}/`);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.id !== itemId),
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useIncreaseQuantity = () => {
  const updateMutation = useUpdateCartItem();
  
  return {
    mutate: (itemId, currentQuantity) => {
      updateMutation.mutate({
        itemId,
        quantity: currentQuantity + 1,
      });
    },
    isPending: updateMutation.isPending,
  };
};

export const useDecreaseQuantity = () => {
  const updateMutation = useUpdateCartItem();

  return {
    mutate: (itemId, currentQuantity) => {
      if (currentQuantity > 1) {
        updateMutation.mutate({
          itemId,
          quantity: currentQuantity - 1,
        });
      }
    },
    isPending: updateMutation.isPending,
  };
};
