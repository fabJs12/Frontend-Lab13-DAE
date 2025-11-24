"""
EJEMPLO DE DATOS DE PRUEBA PARA POPULA EL BACKEND

Este archivo contiene ejemplos de cómo crear datos de prueba en Django
para que funcione correctamente con la aplicación React.

PASOS:

1. Copiar este código en Django shell o crear management command
2. Ejecutar: python manage.py shell
3. Pegar los comandos
4. Verificar que los datos están en http://localhost:8000/admin

"""

# ============================================
# OPCIÓN 1: Usar Django Shell
# ============================================

# python manage.py shell

from apps.tienda.models import Categoria, Producto

# Crear Categorías
cat_estrategia = Categoria.objects.create(
    nombre="Estrategia",
    descripcion="Juegos de estrategia complejos y desafiantes"
)

cat_rol = Categoria.objects.create(
    nombre="Rol",
    descripcion="Juegos de rol y aventura inmersivos"
)

cat_party = Categoria.objects.create(
    nombre="Party Games",
    descripcion="Juegos para jugar en grupo"
)

cat_cooperativo = Categoria.objects.create(
    nombre="Cooperativos",
    descripcion="Juegos donde todos juegan juntos"
)

# Crear Productos - Estrategia
Producto.objects.create(
    nombre="Catan",
    descripcion="El clásico juego de estrategia donde construyes asentamientos y ciudades",
    precio=89.99,
    stock=15,
    imagen_url="https://via.placeholder.com/400x300?text=Catan",
    categoria=cat_estrategia
)

Producto.objects.create(
    nombre="Chess Royale",
    descripcion="Variante moderna del ajedrez con nuevas piezas",
    precio=34.99,
    stock=22,
    imagen_url="https://via.placeholder.com/400x300?text=Chess+Royale",
    categoria=cat_estrategia
)

Producto.objects.create(
    nombre="Go",
    descripcion="Juego clásico milenario de estrategia territorial",
    precio=24.99,
    stock=18,
    imagen_url="https://via.placeholder.com/400x300?text=Go",
    categoria=cat_estrategia
)

# Crear Productos - Rol
Producto.objects.create(
    nombre="Dungeons & Dragons Starter Set",
    descripcion="Kit de inicio para aventuras épicas en mundos fantásticos",
    precio=49.99,
    stock=20,
    imagen_url="https://via.placeholder.com/400x300?text=D%26D",
    categoria=cat_rol
)

Producto.objects.create(
    nombre="Pathfinder 2e",
    descripcion="RPG de fantasía con reglas complejas y profundas",
    precio=59.99,
    stock=12,
    imagen_url="https://via.placeholder.com/400x300?text=Pathfinder",
    categoria=cat_rol
)

Producto.objects.create(
    nombre="Call of Cthulhu",
    descripcion="RPG de horror y misterio en la Era Dorada",
    precio=45.99,
    stock=8,
    imagen_url="https://via.placeholder.com/400x300?text=Cthulhu",
    categoria=cat_rol
)

# Crear Productos - Party Games
Producto.objects.create(
    nombre="Códigos Secretos",
    descripcion="Adivina palabras secretas trabajando en equipo",
    precio=29.99,
    stock=30,
    imagen_url="https://via.placeholder.com/400x300?text=Codigos",
    categoria=cat_party
)

Producto.objects.create(
    nombre="Dixit",
    descripcion="Juego de imaginación y creatividad con hermosas ilustraciones",
    precio=34.99,
    stock=16,
    imagen_url="https://via.placeholder.com/400x300?text=Dixit",
    categoria=cat_party
)

# Crear Productos - Cooperativos
Producto.objects.create(
    nombre="Pandemic",
    descripcion="Trabaja con otros jugadores para salvar el mundo de enfermedades",
    precio=54.99,
    stock=11,
    imagen_url="https://via.placeholder.com/400x300?text=Pandemic",
    categoria=cat_cooperativo
)

Producto.objects.create(
    nombre="Gloomhaven",
    descripcion="Épica aventura cooperativa con campaña persistente",
    precio=129.99,
    stock=5,
    imagen_url="https://via.placeholder.com/400x300?text=Gloomhaven",
    categoria=cat_cooperativo
)

print("✓ Datos de prueba creados exitosamente")

# ============================================
# OPCIÓN 2: Crear Management Command
# ============================================

# Crear archivo: apps/tienda/management/commands/load_test_data.py

"""
from django.core.management.base import BaseCommand
from apps.tienda.models import Categoria, Producto


class Command(BaseCommand):
    help = 'Carga datos de prueba para la tienda'

    def handle(self, *args, **options):
        # Limpiar datos anteriores
        Producto.objects.all().delete()
        Categoria.objects.all().delete()

        # Crear Categorías
        categorias = [
            {
                'nombre': 'Estrategia',
                'descripcion': 'Juegos de estrategia complejos'
            },
            {
                'nombre': 'Rol',
                'descripcion': 'Juegos de rol y aventura'
            },
            {
                'nombre': 'Party Games',
                'descripcion': 'Juegos para grupos'
            },
            {
                'nombre': 'Cooperativos',
                'descripcion': 'Juegos cooperativos'
            },
        ]

        cat_dict = {}
        for cat_data in categorias:
            cat = Categoria.objects.create(**cat_data)
            cat_dict[cat.nombre] = cat

        # Crear Productos
        productos = [
            {
                'nombre': 'Catan',
                'descripcion': 'El clásico juego de estrategia',
                'precio': 89.99,
                'stock': 15,
                'imagen_url': 'https://via.placeholder.com/400x300?text=Catan',
                'categoria': cat_dict['Estrategia']
            },
            # ... más productos
        ]

        for prod_data in productos:
            Producto.objects.create(**prod_data)

        self.stdout.write(self.style.SUCCESS('Datos cargados exitosamente'))
"""

# Ejecutar: python manage.py load_test_data

# ============================================
# VERIFICAR DATOS EN EL ADMIN
# ============================================

# 1. Registrar modelos en admin.py

"""
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
"""

# 2. Crear superusuario
# python manage.py createsuperuser

# 3. Acceder a http://localhost:8000/admin

# ============================================
# VERIFICAR API EN NAVEGADOR
# ============================================

# GET /api/categorias/
# GET /api/productos/
# GET /api/categorias/1/productos/
# GET /api/carrito/

