
import os
import sys
import site

# If a local virtualenv `.venv` exists in the project, add its site-packages
# to sys.path so the user can run `python app.py` without activating the venv.
# This is a convenience shim (Windows and POSIX paths are handled).
try:
    PROJECT_ROOT = os.path.dirname(__file__)
    venv_paths = []
    # Windows venv layout
    venv_paths.append(os.path.join(PROJECT_ROOT, '.venv', 'Lib', 'site-packages'))
    # POSIX venv layout (include the current running python minor version)
    pyver = f"python{sys.version_info.major}.{sys.version_info.minor}"
    venv_paths.append(os.path.join(PROJECT_ROOT, '.venv', 'lib', pyver, 'site-packages'))
    for p in venv_paths:
        if os.path.isdir(p) and p not in sys.path:
            site.addsitedir(p)
            # ensure it's early in sys.path
            sys.path.insert(0, p)
            break
except Exception:
    # If anything goes wrong, continue and let normal imports raise helpful errors
    pass

from flask import Flask
from config.database import Base, engine
from models.producto_model import Producto
from controllers.usuarios_controller import usuarios_bp, register_jwt_error_handlers
from controllers.productos_controller import productos_bp
try:
    from controllers.auth_controller import auth_bp
except ImportError:
    auth_bp = None
from config.jwt import *
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

app = Flask(__name__)
# Configurar JWT a partir de config/jwt.py (permite cargar desde .env)
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['JWT_TOKEN_LOCATION'] = JWT_TOKEN_LOCATION
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = JWT_ACCESS_TOKEN_EXPIRES
app.config['JWT_HEADER_NAME'] = JWT_HEADER_NAME
app.config['JWT_HEADER_TYPE'] = JWT_HEADER_TYPE

# Asegurar headers CORS y métodos permitidos en todas las respuestas
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response



jwt = JWTManager(app)
CORS(app,
    supports_credentials=True,
    resources={r"/*": {"origins": "*"}},
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["Authorization"])

# Registrar blueprints
app.register_blueprint(usuarios_bp)
app.register_blueprint(productos_bp)
if auth_bp:
    app.register_blueprint(auth_bp)

# Registrar manejadores de error JWT definidos en controllers/user_controller
register_jwt_error_handlers(app)

if __name__ == "__main__":
    app.run(debug=True)



