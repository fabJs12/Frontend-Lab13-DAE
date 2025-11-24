"""
GUÍA DE ENDPOINTS API - DJANGO BACKEND

Este archivo describe los endpoints que debes crear en tu API Django para que
funcione correctamente con el frontend de React Query.

BASE URL: http://127.0.0.1:8000/api/

============================================
ENDPOINTS DE CARRITO
============================================

1. GET /carrito/
   Descripción: Obtiene el contenido del carrito
   Respuesta: 
   {
     "items": [
       {
         "id": 1,
         "producto_id": 1,
         "nombre": "Catan",
         "precio": 89.99,
         "cantidad": 2,
         "imagen_url": "..."
       }
     ]
   }

2. POST /carrito/agregar/
   Descripción: Agrega un producto al carrito
   Body:
   {
     "producto_id": 1,
     "cantidad": 1
   }
   Validaciones:
   - Verificar que el producto existe
   - Verificar que hay stock disponible
   - Si ya existe en carrito, sumar cantidad
   Respuesta:
   {
     "id": 1,
     "producto_id": 1,
     "nombre": "Catan",
     "precio": 89.99,
     "cantidad": 3,
     "imagen_url": "..."
   }

3. PUT /carrito/actualizar/{item_id}/
   Descripción: Actualiza la cantidad de un producto en el carrito
   Body:
   {
     "cantidad": 5
   }
   Validaciones:
   - Verificar que cantidad es mayor a 0
   - Verificar que hay stock suficiente
   Respuesta:
   {
     "id": 1,
     "producto_id": 1,
     "nombre": "Catan",
     "precio": 89.99,
     "cantidad": 5,
     "imagen_url": "..."
   }

4. DELETE /carrito/eliminar/{item_id}/
   Descripción: Elimina un producto del carrito
   Respuesta: { "message": "Producto eliminado del carrito" }

============================================
ENDPOINTS DE CATEGORÍAS
============================================

1. GET /categorias/
   Descripción: Lista todas las categorías
   Respuesta:
   [
     {
       "id": 1,
       "nombre": "Estrategia",
       "descripcion": "Juegos de estrategia..."
     },
     {
       "id": 2,
       "nombre": "Rol",
       "descripcion": "Juegos de rol..."
     }
   ]

2. GET /categorias/{category_id}/productos/
   Descripción: Obtiene todos los productos de una categoría
   Respuesta:
   [
     {
       "id": 1,
       "nombre": "Catan",
       "precio": 89.99,
       "stock": 10,
       "imagen_url": "...",
       "categoria": 1
     }
   ]

============================================
MODELO DE DATOS RECOMENDADO
============================================

# models.py

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

    def __str__(self):
        return self.nombre


class CarritoItem(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"

============================================
SERIALIZERS RECOMENDADOS
============================================

# serializers.py

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion']


class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precio', 'stock', 'imagen_url', 'categoria']


class CarritoItemSerializer(serializers.ModelSerializer):
    # Información del producto
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

============================================
VISTAS (VIEWSETS) RECOMENDADAS
============================================

# views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    @action(detail=True, methods=['get'])
    def productos(self, request, pk=None):
        categoria = self.get_object()
        productos = categoria.productos.all()
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)


class CarritoViewSet(viewsets.ViewSet):
    
    def list(self, request):
        """GET /carrito/ - Listar contenido del carrito"""
        items = CarritoItem.objects.all()
        serializer = CarritoItemSerializer(items, many=True)
        return Response({'items': serializer.data})

    @action(detail=False, methods=['post'])
    def agregar(self, request):
        """POST /carrito/agregar/ - Agregar producto al carrito"""
        producto_id = request.data.get('producto_id')
        cantidad = request.data.get('cantidad', 1)

        producto = get_object_or_404(Producto, id=producto_id)

        # Validar stock
        if producto.stock < cantidad:
            return Response(
                {'error': 'Stock insuficiente'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar si ya existe en carrito
        item, created = CarritoItem.objects.get_or_create(
            producto=producto,
            defaults={'cantidad': cantidad}
        )

        if not created:
            item.cantidad += cantidad
            item.save()

        serializer = CarritoItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['put'], url_path=r'actualizar/(?P<item_id>\d+)')
    def actualizar(self, request, item_id=None):
        """PUT /carrito/actualizar/{item_id}/ - Actualizar cantidad"""
        item = get_object_or_404(CarritoItem, id=item_id)
        cantidad = request.data.get('cantidad')

        if cantidad is None or cantidad <= 0:
            return Response(
                {'error': 'Cantidad debe ser mayor a 0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if item.producto.stock < cantidad:
            return Response(
                {'error': 'Stock insuficiente'},
                status=status.HTTP_400_BAD_REQUEST
            )

        item.cantidad = cantidad
        item.save()

        serializer = CarritoItemSerializer(item)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'], url_path=r'eliminar/(?P<item_id>\d+)')
    def eliminar(self, request, item_id=None):
        """DELETE /carrito/eliminar/{item_id}/ - Eliminar del carrito"""
        item = get_object_or_404(CarritoItem, id=item_id)
        item.delete()
        return Response({'message': 'Producto eliminado'}, status=status.HTTP_204_NO_CONTENT)

============================================
URL ROUTING (urls.py)
============================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categorias', views.CategoriaViewSet, basename='categoria')
router.register(r'carrito', views.CarritoViewSet, basename='carrito')

urlpatterns = [
    path('', include(router.urls)),
    # ... otros endpoints existentes
]

"""
