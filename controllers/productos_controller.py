from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.producto_service import crear_producto, obtener_productos, actualizar_producto, eliminar_producto
from config.database import get_db

productos_bp = Blueprint('productos', __name__)


@productos_bp.route('/productos', methods=['GET'])
@jwt_required()
def list_productos():
    from flask import request
    import logging
    logging.info(f"HEADERS RECIBIDOS EN /productos: {dict(request.headers)}")
    productos = obtener_productos()
    return jsonify(productos), 200


@productos_bp.route('/productos/<int:producto_id>', methods=['GET'])
def get_producto(producto_id):
    # servicio de producto maneja la sesión internamente
    productos = obtener_productos()
    for p in productos:
        if p['id'] == producto_id:
            return jsonify(p), 200
    return jsonify({'error': 'Producto no encontrado'}), 404


@productos_bp.route('/productos', methods=['POST'])
@jwt_required()
def create_producto():
    data = request.get_json()
    if not data or not data.get('nombre'):
        return jsonify({'error': 'Datos invalidos'}), 400
    nuevo = crear_producto(data)
    return jsonify(nuevo), 201


@productos_bp.route('/productos/<int:producto_id>', methods=['PUT'])
@jwt_required()
def update_producto(producto_id):
    data = request.get_json()
    actualizado = actualizar_producto(producto_id, data)
    if 'mensaje' in actualizado:
        return jsonify(actualizado), 404
    return jsonify(actualizado), 200


@productos_bp.route('/productos/<int:producto_id>', methods=['DELETE'])
@jwt_required()
def delete_producto(producto_id):
    resultado = eliminar_producto(producto_id)
    if 'mensaje' in resultado and 'no encontrado' in resultado['mensaje']:
        return jsonify(resultado), 404
    return jsonify(resultado), 200
