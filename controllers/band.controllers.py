from flask import Blueprint, jsonify

band_bp = Blueprint("band_bp", __name__)


@band_bp.route('/bands', methods=['GET'])
def list_bands():
    # Placeholder endpoint: retorna lista vacía
    return jsonify([]), 200


@band_bp.route('/bands/<int:band_id>', methods=['GET'])
def get_band(band_id):
    return jsonify({'error': 'Not implemented'}), 501