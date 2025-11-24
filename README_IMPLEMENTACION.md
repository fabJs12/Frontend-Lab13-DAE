# Implementación de Carrito con React Query v5 y Django

## 📋 Requisitos Implementados en Frontend

### ✅ Completado

1. **React Query v5 Integration**
   - QueryClient configurado con opciones óptimas
   - Caché de 5 minutos (staleTime)
   - GC time de 10 minutos
   - Retry automático

2. **Hooks Personalizados** (`src/hooks/useQueries.js`)
   - `useProducts()` - Obtener todos los productos
   - `useProductDetail(id)` - Obtener detalle de un producto
   - `usePrefetchProductDetail()` - Prefetch de detalle
   - `useCategories()` - Obtener todas las categorías
   - `useCategoryProducts(categoryId)` - Obtener productos de una categoría
   - `usePrefetchCategoryProducts()` - Prefetch de categorías
   - `useCart()` - Obtener carrito
   - `useAddToCart()` - Agregar al carrito (con optimistic updates)
   - `useUpdateCartItem()` - Actualizar cantidad
   - `useRemoveFromCart()` - Eliminar del carrito
   - `useIncreaseQuantity()` - Incrementar cantidad (helper)
   - `useDecreaseQuantity()` - Decrementar cantidad (helper)

3. **Mutaciones Optimistas**
   - Actualización inmediata del UI
   - Rollback automático en caso de error
   - Invalidación de caché después del éxito
   - Error handling completo

4. **Páginas Implementadas**
   - **Home** - Listado de productos con prefetch
   - **ProductDetail** - Detalle del producto con cantidad variable
   - **Cart** - Carrito completo con incremento/decremento
   - **Categories** - Listado de categorías (nueva vista)
   - **CategoryProducts** - Productos filtrados por categoría (nueva vista)

5. **Prefetch de Datos**
   - En Home: al pasar mouse sobre producto
   - En Categories: al pasar mouse sobre categoría
   - En CategoryProducts: al pasar mouse sobre producto
   - En ProductDetail: carga automática

## 🔧 Qué Necesitas Implementar en Django

### Base de Datos - Modelos

```python
# models.py

from django.db import models

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categorías"

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    imagen_url = models.URLField(blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre

    class Meta:
        ordering = ['-created_at']


class CarritoItem(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"

    class Meta:
        unique_together = ('producto',)  # Un item por producto en el carrito
```

### Serializers

```python
# serializers.py

from rest_framework import serializers
from .models import Categoria, Producto, CarritoItem


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion']


class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precio', 'stock', 'imagen_url', 'categoria']


class CarritoItemSerializer(serializers.ModelSerializer):
    # Información del producto anidada
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_precio = serializers.DecimalField(
        source='producto.precio',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    producto_imagen = serializers.URLField(source='producto.imagen_url', read_only=True)

    class Meta:
        model = CarritoItem
        fields = ['id', 'producto', 'cantidad', 'producto_nombre', 'producto_precio', 'producto_imagen']

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        return value


class CarritoResponseSerializer(serializers.Serializer):
    items = CarritoItemSerializer(many=True)
```

### ViewSets (Vistas)

```python
# views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .models import Categoria, Producto, CarritoItem
from .serializers import (
    CategoriaSerializer, ProductoSerializer, 
    CarritoItemSerializer, CarritoResponseSerializer
)


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    @action(detail=True, methods=['get'])
    def productos(self, request, pk=None):
        """GET /api/categorias/{id}/productos/"""
        categoria = self.get_object()
        productos = categoria.productos.all()
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer


class CarritoViewSet(viewsets.ViewSet):
    """
    API ViewSet para gestionar el carrito de compras
    """

    @action(detail=False, methods=['get'])
    def list(self, request):
        """GET /api/carrito/ - Listar contenido del carrito"""
        items = CarritoItem.objects.all()
        serializer = CarritoItemSerializer(items, many=True)
        return Response({'items': serializer.data})

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):
        """POST /api/carrito/agregar/ - Agregar producto al carrito"""
        producto_id = request.data.get('producto_id')
        cantidad = request.data.get('cantidad', 1)

        # Validar entrada
        if not producto_id:
            return Response(
                {'error': 'producto_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cantidad = int(cantidad)
            if cantidad <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {'error': 'cantidad debe ser un número mayor a 0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener producto
        producto = get_object_or_404(Producto, id=producto_id)

        # Validar stock
        if producto.stock < cantidad:
            return Response(
                {'error': f'Stock insuficiente. Disponible: {producto.stock}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear o actualizar item en carrito
        item, created = CarritoItem.objects.get_or_create(
            producto=producto,
            defaults={'cantidad': cantidad}
        )

        if not created:
            # Si ya existe, aumentar cantidad
            if item.cantidad + cantidad > producto.stock:
                return Response(
                    {'error': 'Stock insuficiente para esa cantidad'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.cantidad += cantidad
            item.save()

        serializer = CarritoItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['put'], url_path=r'actualizar/(?P<item_id>\d+)')
    def actualizar(self, request, item_id=None):
        """PUT /api/carrito/actualizar/{item_id}/ - Actualizar cantidad"""
        item = get_object_or_404(CarritoItem, id=item_id)
        cantidad = request.data.get('cantidad')

        # Validaciones
        if cantidad is None:
            return Response(
                {'error': 'cantidad es requerida'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cantidad = int(cantidad)
        except (ValueError, TypeError):
            return Response(
                {'error': 'cantidad debe ser un número entero'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if cantidad <= 0:
            return Response(
                {'error': 'cantidad debe ser mayor a 0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar stock
        if item.producto.stock < cantidad:
            return Response(
                {'error': f'Stock insuficiente. Disponible: {item.producto.stock}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        item.cantidad = cantidad
        item.save()

        serializer = CarritoItemSerializer(item)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'], url_path=r'eliminar/(?P<item_id>\d+)')
    def eliminar(self, request, item_id=None):
        """DELETE /api/carrito/eliminar/{item_id}/ - Eliminar del carrito"""
        item = get_object_or_404(CarritoItem, id=item_id)
        item.delete()
        return Response(
            {'message': 'Producto eliminado del carrito'},
            status=status.HTTP_204_NO_CONTENT
        )
```

### URLs Routing

```python
# urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categorias', views.CategoriaViewSet, basename='categoria')
router.register(r'productos', views.ProductoViewSet, basename='producto')
router.register(r'carrito', views.CarritoViewSet, basename='carrito')

urlpatterns = [
    path('', include(router.urls)),
]
```

## 🚀 Pasos para Configurar el Backend

1. **Crear modelos:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Cargar datos de prueba:**
   ```python
   # create_test_data.py
   from django.core.management.base import BaseCommand
   from apps.tienda.models import Categoria, Producto

   class Command(BaseCommand):
       def handle(self, *args, **options):
           # Crear categorías
           estrategia, _ = Categoria.objects.get_or_create(
               nombre="Estrategia",
               defaults={"descripcion": "Juegos de estrategia complejos"}
           )
           rol, _ = Categoria.objects.get_or_create(
               nombre="Rol",
               defaults={"descripcion": "Juegos de rol y aventura"}
           )

           # Crear productos
           Producto.objects.get_or_create(
               nombre="Catan",
               defaults={
                   "descripcion": "Clásico juego de estrategia y comercio",
                   "precio": 89.99,
                   "stock": 15,
                   "imagen_url": "https://via.placeholder.com/400x300?text=Catan",
                   "categoria": estrategia
               }
           )

           Producto.objects.get_or_create(
               nombre="Dungeons & Dragons Starter Set",
               defaults={
                   "descripcion": "Kit de inicio para juegos de rol",
                   "precio": 49.99,
                   "stock": 20,
                   "imagen_url": "https://via.placeholder.com/400x300?text=D%26D",
                   "categoria": rol
               }
           )
   ```

   ```bash
   python manage.py create_test_data
   ```

3. **Verificar endpoints con curl:**
   ```bash
   # Listar categorías
   curl http://localhost:8000/api/categorias/

   # Listar productos de una categoría
   curl http://localhost:8000/api/categorias/1/productos/

   # Listar carrito
   curl http://localhost:8000/api/carrito/

   # Agregar al carrito
   curl -X POST http://localhost:8000/api/carrito/agregar/ \
     -H "Content-Type: application/json" \
     -d '{"producto_id": 1, "cantidad": 2}'
   ```

## 🎯 Flujo de Funcionamiento

### Carrito con Optimistic Updates

1. **Usuario hace clic en "Añadir al Carrito"**
   ↓
2. **React Query actualiza el caché INMEDIATAMENTE** (optimistic)
   ↓
3. **Frontend envía solicitud POST al backend**
   ↓
4. **Backend valida y crea el item en carrito**
   ↓
5. **Si éxito:** caché se invalida y se re-sincroniza ✅
   ↓
6. **Si error:** caché hace rollback al estado anterior 🔄

### Prefetch de Datos

1. **Usuario pasa mouse sobre un producto**
   ↓
2. **React Query silenciosamente pre-carga los datos**
   ↓
3. **Usuario hace clic en el producto**
   ↓
4. **Los datos ya están listos (muy rápido)** ⚡

## 📊 Estructura de Carpetas Frontend

```
src/
├── components/
│   ├── NavBar.js (actualizado)
│   └── ProductCard.js
├── pages/
│   ├── Home.js (con prefetch)
│   ├── ProductDetail.js (con React Query)
│   ├── Cart.js (con mutaciones optimistas)
│   ├── Categories.js (nueva)
│   └── CategoryProducts.js (nueva)
├── hooks/
│   └── useQueries.js (todos los hooks)
├── context/
│   └── CartContext.js
├── services/
│   └── api.js
└── App.js (con nuevas rutas)
```

## 🧪 Testing Manual

1. **Visita http://localhost:3001**
2. **Hover sobre un producto y espera que cargue**
3. **Haz clic en el producto (debe ir rápido)**
4. **Aumenta la cantidad y agrégalo al carrito**
5. **Verifica que el número en el carrito se actualiza**
6. **Ve al carrito y prueba incrementar/decrementar**
7. **Prueba eliminar productos**
8. **Abre DevTools → Network para ver las peticiones**

## ✨ Características Destacadas

- ✅ Mutaciones optimistas (UI actualiza antes de backend)
- ✅ Rollback automático en errores
- ✅ Prefetch de datos al hover
- ✅ Invalidación de caché inteligente
- ✅ Validación de stock en backend
- ✅ Manejo completo de errores
- ✅ Loading states
- ✅ Responsive design
- ✅ Categorías dinámicas
- ✅ Carrito con operaciones CRUD

