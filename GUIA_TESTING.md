# 🚀 Guía de Instalación y Testing - React Query Cart

## ✅ Estado Actual Frontend

Toda la implementación de **React Query v5** está **LISTA** en el frontend. 

### Lo que ya está implementado:

1. ✅ **React Query v5 instalado y configurado**
   - QueryClient con opciones óptimas
   - 5 minutos staleTime
   - 10 minutos gcTime (garbage collection)

2. ✅ **Hooks Personalizados** (`src/hooks/useQueries.js`)
   - 12 hooks diferentes
   - Mutaciones optimistas
   - Rollback en errores
   - Prefetch de datos

3. ✅ **Vistas Actualizadas**
   - Home con prefetch
   - ProductDetail con cantidad variable
   - Cart con incremento/decremento
   - Categories (NUEVA)
   - CategoryProducts (NUEVA)

4. ✅ **Prefetch de Datos**
   - Al hover en Home
   - Al hover en Categories
   - Al hover en CategoryProducts

## 🔧 Qué Necesitas Hacer en Django

### PASO 1: Crear los Modelos

Abre `apps/tienda/models.py` y añade:

```python
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
        unique_together = ('producto',)
```

### PASO 2: Hacer Migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

### PASO 3: Crear Serializers

Abre `apps/tienda/serializers.py` y añade:

```python
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
```

### PASO 4: Crear ViewSets

Abre `apps/tienda/views.py` y añade:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Categoria, Producto, CarritoItem
from .serializers import CategoriaSerializer, ProductoSerializer, CarritoItemSerializer


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
    """API ViewSet para gestionar el carrito de compras"""

    @action(detail=False, methods=['get'])
    def list(self, request):
        """GET /api/carrito/"""
        items = CarritoItem.objects.all()
        serializer = CarritoItemSerializer(items, many=True)
        return Response({'items': serializer.data})

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):
        """POST /api/carrito/agregar/"""
        producto_id = request.data.get('producto_id')
        cantidad = request.data.get('cantidad', 1)

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

        producto = get_object_or_404(Producto, id=producto_id)

        if producto.stock < cantidad:
            return Response(
                {'error': f'Stock insuficiente. Disponible: {producto.stock}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        item, created = CarritoItem.objects.get_or_create(
            producto=producto,
            defaults={'cantidad': cantidad}
        )

        if not created:
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
        """PUT /api/carrito/actualizar/{item_id}/"""
        item = get_object_or_404(CarritoItem, id=item_id)
        cantidad = request.data.get('cantidad')

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
        """DELETE /api/carrito/eliminar/{item_id}/"""
        item = get_object_or_404(CarritoItem, id=item_id)
        item.delete()
        return Response(
            {'message': 'Producto eliminado del carrito'},
            status=status.HTTP_204_NO_CONTENT
        )
```

### PASO 5: Configurar URLs

Abre `apps/tienda/urls.py` o crea uno:

```python
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

Y en el `urls.py` principal:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.tienda.urls')),  # Ajusta según tu estructura
]
```

### PASO 6: Cargar Datos de Prueba

```bash
python manage.py shell
```

Luego copia y pega el contenido de `TEST_DATA_EXAMPLES.py`

### PASO 7: Registrar en Admin

Abre `apps/tienda/admin.py`:

```python
from django.contrib import admin
from .models import Categoria, Producto, CarritoItem

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'descripcion']
    search_fields = ['nombre']

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'precio', 'stock', 'categoria']
    list_filter = ['categoria', 'created_at']
    search_fields = ['nombre', 'descripcion']

@admin.register(CarritoItem)
class CarritoItemAdmin(admin.ModelAdmin):
    list_display = ['producto', 'cantidad', 'created_at']
    list_filter = ['producto__categoria', 'created_at']
```

## 🧪 Testing

### 1. Verificar API con curl

```bash
# Listar categorías
curl -s http://localhost:8000/api/categorias/ | python -m json.tool

# Listar productos
curl -s http://localhost:8000/api/productos/ | python -m json.tool

# Listar productos de categoría 1
curl -s http://localhost:8000/api/categorias/1/productos/ | python -m json.tool

# Listar carrito
curl -s http://localhost:8000/api/carrito/ | python -m json.tool

# Agregar al carrito
curl -X POST http://localhost:8000/api/carrito/agregar/ \
  -H "Content-Type: application/json" \
  -d '{"producto_id": 1, "cantidad": 2}' | python -m json.tool

# Actualizar cantidad (item_id=1)
curl -X PUT http://localhost:8000/api/carrito/actualizar/1/ \
  -H "Content-Type: application/json" \
  -d '{"cantidad": 5}' | python -m json.tool

# Eliminar del carrito (item_id=1)
curl -X DELETE http://localhost:8000/api/carrito/eliminar/1/
```

### 2. Testing en el Navegador

1. Abre http://localhost:3001
2. Haz hover sobre un producto (verifica que carga en Network tab)
3. Haz clic en el producto
4. Aumenta cantidad y añade al carrito
5. El número en el badge del carrito debe actualizar
6. Ve a /carrito
7. Prueba incrementar/decrementar
8. Prueba eliminar

### 3. Verificar React Query DevTools

En la consola del navegador (F12 → Console):

```javascript
// Ver caché de React Query
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
console.log(queryClient.getQueryCache().getAll());
```

## 📊 Endpoints Finales

```
GET    /api/categorias/
POST   /api/categorias/ (crear)
GET    /api/categorias/{id}/
PUT    /api/categorias/{id}/ (actualizar)
DELETE /api/categorias/{id}/ (eliminar)
GET    /api/categorias/{id}/productos/

GET    /api/productos/
POST   /api/productos/ (crear)
GET    /api/productos/{id}/
PUT    /api/productos/{id}/ (actualizar)
DELETE /api/productos/{id}/ (eliminar)

GET    /api/carrito/
POST   /api/carrito/agregar/
PUT    /api/carrito/actualizar/{item_id}/
DELETE /api/carrito/eliminar/{item_id}/
```

## ✨ Características Implementadas

✅ React Query v5 con optimistic updates
✅ Mutaciones con rollback automático
✅ Prefetch de datos al hover
✅ Invalidación de caché inteligente
✅ Validación de stock
✅ Manejo completo de errores
✅ Loading y error states
✅ Categorías dinámicas
✅ Carrito CRUD completo
✅ Responsive design

## 🎯 Próximos Pasos

1. Implementa los modelos y serializers en Django
2. Crea los ViewSets
3. Configura URLs
4. Carga datos de prueba
5. ¡Prueba todo!

¡El frontend ya está **100% listo** para funcionar con tu backend! 🚀

