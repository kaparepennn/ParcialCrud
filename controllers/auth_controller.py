from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
	return jsonify(message="Acceso autorizado a la ruta protegida de autenticación"), 200
