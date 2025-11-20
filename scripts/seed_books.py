import os
import sys
# Asegurar que el directorio raíz del proyecto está en sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from services.libro_service import crear_libro, obtener_libros

SAMPLES = [
    {
        "title": "Cien años de soledad",
        "author": "Gabriel García Márquez",
        "isbn": "978-0307474728",
        "published_date": "1967",
        "pages": 417,
        "description": "Novela emblemática del realismo mágico."
    },
    {
        "title": "Don Quijote de la Mancha",
        "author": "Miguel de Cervantes",
        "isbn": "978-8491050253",
        "published_date": "1605",
        "pages": 992,
        "description": "La clásica novela española sobre el caballero andante."
    },
    {
        "title": "La ciudad y los perros",
        "author": "Mario Vargas Llosa",
        "isbn": "978-8420635156",
        "published_date": "1963",
        "pages": 416,
        "description": "Novela que critica la sociedad peruana."
    }
]


def seed():
    created = []
    for s in SAMPLES:
        try:
            b = crear_libro(s)
            created.append(b)
            print(f"Created: {b}")
        except Exception as e:
            print(f"Error creating {s.get('title')}: {e}")
    print("Seed finished. Current books:")
    print(obtener_libros())


if __name__ == '__main__':
    seed()
