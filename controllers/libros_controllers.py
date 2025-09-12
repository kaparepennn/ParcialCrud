from flask import Blueprint, request, jsonify
from services.libros_service import LibrosService
libros_bp = Blueprint("libros_bp, __name__")

#Importar la sesión de la base de datos
from config.database import get_db_session

#Instancia globar de servicio
service = LibrosService(get_db_session)

libros_bp = Blueprint("Libros_bp, __name__")

#READ (R): Leer todos los libros
#Método: GET Obtener (solicita datos al servidor ) 

@libros_bp.route("libros", methods=["GET"])
def get_libros():

    libros = service.listar_libros()
    return jsonify([{"id": l.id, "name": l.name} for l in libros]), 200 #JsoniFy convierte el diccionario de libros en una respuesta JSON

#Obtener libro por ID 

@libros_bp.route("/libros/<int:id>", methods=["GET"]) #Variable dinámica que indica que la parte <...> es una variable
def obtener_libro_por_ID(libro_id):

    libro = service.obtener_libro(libro_id)
    if libro:
        return jsonify({"id": libro.id, "name": libro.name}), 200 
    return jsonify({"error": "Libro no encontrado"}), 404 

#CREATE (C): Crear un nuevo libro
#Método: POST para crear un nuevo libro

@libros_bp.route("\libros", methods=["POST"])
def create_libro():
    
    data=request.get_json()
    name=data.get("name")
    if not name:
        return jsonify({"error": "El nombre es obligatorio"}), 400 
    band = service.crear_banda(name)
    return jsonify({"id": band.id, "name": band.name}), 201 

#Update (U): Actualizar un libro
#Método: PUT actualizar libros con obtener el nuevo libro creado

@libros_bp.route("/libros/<int:id>", methods=["PUT"])
def actualizar_libro(libro_id):

    data=request.get_json()
    name=data.get("name")
    libro=service.actualizar_libro(libro_id, name)

    if libro:
        return jsonify({"id": libro_id, "name": libro.name}), 200
    return jsonify({"error": "libro no encontrado"}), 404

#Delete (D): Borrar un libro
#Método: DELETE para eliminar algún libro igualmente por ID

@libros_bp.route("/libros/<int:id>", methods=["DELETE"])
def eliminar_libro(libro_id):
    
    libro = service,eliminar_libro(libro_id)
    if libro:
        return jsonify({"message": "Libro eliminado"}), 200
    return jsonify({"error": "Libro no encontrado"}), 404
