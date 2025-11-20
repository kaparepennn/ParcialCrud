from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.libro_service import crear_libro, obtener_libros, actualizar_libro, eliminar_libro

books_bp = Blueprint('books', __name__)


@books_bp.route('/books', methods=['GET'])
def list_books():
    libros = obtener_libros()
    return jsonify(libros), 200


@books_bp.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    libros = obtener_libros()
    for b in libros:
        if b['id'] == book_id:
            return jsonify(b), 200
    return jsonify({'error': 'Book not found'}), 404


@books_bp.route('/books', methods=['POST'])
@jwt_required()
def create_book():
    data = request.get_json()
    # Basic validation
    if not data or not data.get('title'):
        return jsonify({'error': 'Invalid data'}), 400
    nuevo = crear_libro(data)
    return jsonify(nuevo), 201


@books_bp.route('/books/<int:book_id>', methods=['PUT'])
@jwt_required()
def update_book(book_id):
    data = request.get_json()
    actualizado = actualizar_libro(book_id, data)
    if 'mensaje' in actualizado:
        return jsonify(actualizado), 404
    return jsonify(actualizado), 200


@books_bp.route('/books/<int:book_id>', methods=['DELETE'])
@jwt_required()
def delete_book(book_id):
    resultado = eliminar_libro(book_id)
    if 'mensaje' in resultado and 'no encontrado' in resultado['mensaje']:
        return jsonify(resultado), 404
    return jsonify(resultado), 200
