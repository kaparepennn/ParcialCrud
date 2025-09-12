from repository.libros_repository import autores
from models.libros_model import Libro
from sqlalchemy.orm import session

class BandService:
    def __init__(self, db_session: session):
        self.repository = db_session

def listar_libros(self):
    return self.repository.get_all_libros()

def obtener_libro(self, libro_id: int):
    return self.repository.get_libro_by_id(libro_id)

def crear_libro(self, name: str):
    return self.repository.crear_libro(name)

def actualizar_libro(self, libro_id: int, name: str = None):
    return self.repository.actualuzar_libro(libro_id, name)

def eliminar_libro(self, libro_id: int):
    return self.repository.eliminar_libro(libro_id)