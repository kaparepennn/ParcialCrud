from models.producto_model import Producto
from config.database import get_db_session

def crear_producto(data):
    session = get_db_session()
    nuevo = Producto(
        nombre=data["nombre"],
        precio=data["precio"],
        stock=data["stock"]
    )
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    session.close()
    return nuevo.to_dict()

def obtener_productos():
    session = get_db_session()
    productos = session.query(Producto).all()
    session.close()
    return [p.to_dict() for p in productos]

def actualizar_producto(id, data):
    session = get_db_session()
    producto = session.query(Producto).filter_by(id=id).first()
    if producto:
        producto.nombre = data["nombre"]
        producto.precio = data["precio"]
        producto.stock = data["stock"]
        session.commit()
        actualizado = producto.to_dict()
        session.close()
        return actualizado
    session.close()
    return {"mensaje": "Producto no encontrado"}

def eliminar_producto(id):
    session = get_db_session()
    producto = session.query(Producto).filter_by(id=id).first()
    if producto:
        session.delete(producto)
        session.commit()
        session.close()
        return {"mensaje": f"Producto {id} eliminado"}
    session.close()
    return {"mensaje": "Producto no encontrado"}
