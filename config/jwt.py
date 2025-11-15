import os
from datetime import timedelta

# Leer valores desde .env si existen, con valores por defecto seguros para desarrollo
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') or 'super-secret-key-change-me'
JWT_TOKEN_LOCATION = ['headers']
# Expiración en segundos o timedelta; aquí usamos timedelta de 1 hora por defecto
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
JWT_HEADER_NAME = 'Authorization'
JWT_HEADER_TYPE = 'Bearer'
