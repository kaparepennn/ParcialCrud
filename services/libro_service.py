from models.libro_model import Libro
from config.database import get_db_session

def crear_libro(data):
    session = get_db_session()
    nuevo = Libro(
        title=data.get("title"),
        author=data.get("author"),
        isbn=data.get("isbn"),
        published_date=data.get("published_date"),
        pages=data.get("pages"),
        description=data.get("description")
    )
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    session.close()
    return nuevo.to_dict()

def obtener_libros():
    session = get_db_session()
    libros = session.query(Libro).all()
    session.close()
    return [l.to_dict() for l in libros]

def actualizar_libro(id, data):
    session = get_db_session()
    libro = session.query(Libro).filter_by(id=id).first()
    if libro:
        libro.title = data.get("title", libro.title)
        libro.author = data.get("author", libro.author)
        libro.isbn = data.get("isbn", libro.isbn)
        libro.published_date = data.get("published_date", libro.published_date)
        libro.pages = data.get("pages", libro.pages)
        libro.description = data.get("description", libro.description)
        session.commit()
        actualizado = libro.to_dict()
        session.close()
        return actualizado
    session.close()
    return {"mensaje": "Libro no encontrado"}

def eliminar_libro(id):
    session = get_db_session()
    libro = session.query(Libro).filter_by(id=id).first()
    if libro:
        session.delete(libro)
        session.commit()
        session.close()
        return {"mensaje": f"Libro {id} eliminado"}
    session.close()
    return {"mensaje": "Libro no encontrado"}
