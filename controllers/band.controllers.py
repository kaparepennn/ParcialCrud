from flask import blueprint 

band_bp = blueprint("band_bp",__name__)

@band_bp.route("/bands", methods=['GET'])
    print('hola')

@band_bp.route("/bands/<int:band_id>", methods=['GET'])

@band_bp.route("/bands", methods=['POST'])

@band_bp.route("/bands/<int:band_id>", methods=['GET'])

@band_bp.route("/bands/<int:band_id>", methods=['DELETE'])