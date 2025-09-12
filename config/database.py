import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from models.libros_model import Base
from dotenv import load_dotenv
logging.basicConfig(level=logging.INFO)

# Cargar variables de entorno desde .env
load_dotenv()

MYSQL_URI = os.getenv('MYSQL_URI')
SQLITE_URI = 'sqlite:///libros_local.db'

#Intenta crear una conexión MySQL, si falla, usa una SQLite local.
def get_engine():
    if MYSQL_URI:
        try:
            engine = create_engine(MYSQL_URI, echo=True)
            # Probar conexión
            conn = engine.connect()
            conn.close()
            logging.info('Conexión a MySQL exitosa.')
            return engine
        except OperationalError:
            logging.warning('No se pudo conectar a MySQL. Usando SQLite local.')
    # Fallback a SQLite
    engine = create_engine(SQLITE_URI, echo=True)
    return engine

engine = get_engine()
Session = sessionmaker(bind=engine)
Base.metadata.create_all(engine)

#Retorna una nueva sesión de base de datos para ser utilizada en los servidores o controladores.
def get_db_session():
    return Session()