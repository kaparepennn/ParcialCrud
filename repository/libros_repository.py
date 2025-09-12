from models.libros_model import libro, autores
from sqlalchemy.orm import session

#Repositorio para la gestión de libros en la base de datos

def __init__(self, db_session: session):
    self.db = db_session

#Recuperar todos los libros almacenados de la base de datos
def get_all_libros(self):
    return self.db.query(libro).all()

#Busca y retorna un libro por ID
def get_libro_by_id(self, libro_id: int):
    return self.db.query(libro).filter(libro.id == libro_id).first()

#Crea y almacena un nuevo libro en la base de datos
def create_libro(self, name: str):
    nuevo_libro = libro(name=name)
    self.db.add(nuevo_libro)
    self.db.commit()
    self.db.refresh(nuevo_libro)
    return nuevo_libro

#Actualizar la información de un libro  existente en la base de datos.
def actualizar_libro(selft, libro_id: id, name:str = None):
    libro = selft.get_libro_by_id(libro_id)
    if libro and name:
        libro.name = name
        selft.db.commit()
        selft.db.refresh(libro)
    return libro

#Eliminar un libro de la base de datos, según su ID
def eliminar_banda(self, libro_id: int):
    libro = self.get_libro_by_id(libro_id)
    if libro:
        self.db.delete(libro)
        self.db.commit()
    return libro