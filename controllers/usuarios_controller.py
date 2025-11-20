import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
from services.usuario_service import UsersService
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
# Handler personalizado para errores de autenticación JWT
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask import current_app
from functools import wraps

from config.database import get_db

usuarios_bp = Blueprint('usuarios', __name__)

def register_jwt_error_handlers(app):
    @app.errorhandler(NoAuthorizationError)
    def handle_no_auth_error(e):
        logger.warning("Intento de acceso sin autenticación JWT")
        return jsonify({'error': 'No autenticado. Debe enviar un token JWT valido en el header Authorization.'}), 401, {'Content-Type': 'application/json; charset=utf-8'}


def role_required(required_role):
    """Decorador para proteger rutas según rol contenido en los claims del JWT."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            role = claims.get('role') or (claims.get('additional_claims') and claims['additional_claims'].get('role'))
            if not role:
                logger.warning('Acceso denegado: token sin claim de rol')
                return jsonify({'error': 'Acceso denegado: rol no encontrado en token'}), 403
            if role != required_role:
                logger.warning(f'Acceso denegado: rol {role} no tiene permiso (se requiere {required_role})')
                return jsonify({'error': 'Acceso denegado: rol insuficiente'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


@usuarios_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        logger.warning("Login fallido: usuario o contrasena no proporcionados")
        return jsonify({'error': 'El nombre de usuario y la contrasena son obligatorios'}), 400, {'Content-Type': 'application/json; charset=utf-8'}
    with get_db() as db:
        service = UsersService(db)
        user = service.authenticate_user(username, password)
        if user:
            access_token = create_access_token(identity=user.username, additional_claims={'role': user.role})
            logger.info(f"Usuario autenticado: {username}")
            return jsonify({'access_token': access_token}), 200, {'Content-Type': 'application/json; charset=utf-8'}
    logger.warning(f"Login fallido para usuario: {username}")
    return jsonify({'error': 'Credenciales invalidas'}), 401, {'Content-Type': 'application/json; charset=utf-8'}


@usuarios_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    from flask import request
    logger.info(f"HEADERS RECIBIDOS EN /users: {dict(request.headers)}")
    with get_db() as db:
        service = UsersService(db)
        users = service.get_all_users()
        logger.info("Consulta de todos los usuarios")
        return jsonify([{'id': u.id, 'username': u.username, 'role': u.role} for u in users]), 200, {'Content-Type': 'application/json; charset=utf-8'}


@usuarios_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    with get_db() as db:
        service = UsersService(db)
        user = service.get_user_by_id(user_id)
        if user:
            logger.info(f"Consulta de usuario por ID: {user_id}")
            return jsonify({'id': user.id, 'username': user.username, 'role': user.role}), 200, {'Content-Type': 'application/json; charset=utf-8'}
    logger.warning(f"Usuario no encontrado: {user_id}")
    return jsonify({'error': 'Usuario no encontrado'}), 404, {'Content-Type': 'application/json; charset=utf-8'}


@usuarios_bp.route('/registry', methods=['POST'])
def create_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        logger.warning("Registro fallido: usuario o contraseña no proporcionados")
        return jsonify({'error': 'El nombre de usuario y la contraseña son obligatorios'}), 400, {'Content-Type': 'application/json; charset=utf-8'}
    role = data.get('role', 'cliente')
    with get_db() as db:
        service = UsersService(db)
        user = service.create_user(username, password, role)
        logger.info(f"Usuario creado: {username} con rol: {role}")
        return jsonify({'id': user.id, 'username': user.username, 'role': user.role}), 201, {'Content-Type': 'application/json; charset=utf-8'}


@usuarios_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    with get_db() as db:
        service = UsersService(db)
        user = service.update_user(user_id, username, password)
        if user:
            logger.info(f"Usuario actualizado: {user_id}")
            return jsonify({'id': user.id, 'username': user.username}), 200, {'Content-Type': 'application/json; charset=utf-8'}
    logger.warning(f"Usuario no encontrado para actualizar: {user_id}")
    return jsonify({'error': 'Usuario no encontrado'}), 404, {'Content-Type': 'application/json; charset=utf-8'}


@usuarios_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    with get_db() as db:
        service = UsersService(db)
        user = service.delete_user(user_id)
        if user:
            logger.info(f"Usuario eliminado: {user_id}")
            return jsonify({'message': 'Usuario eliminado correctamente'}), 200, {'Content-Type': 'application/json; charset=utf-8'}
    logger.warning(f"Usuario no encontrado para eliminar: {user_id}")
    return jsonify({'error': 'Usuario no encontrado'}), 404, {'Content-Type': 'application/json; charset=utf-8'}
