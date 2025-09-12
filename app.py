from flask import Flask
from .controllers.libros_controllers import libro_bp

# Instancia de la aplicación Flask
app = Flask(__name__)

# Registro de las rutas de libros en la aplicación
app.register_blueprint(libro_bp)

# Punto de entrada
if __name__ == "__main__":
    app.run(debug=True)  # debug=True → recarga automática y errores visibles
