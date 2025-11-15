import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from contextlib import contextmanager

# Configurar logs
logging.basicConfig(level=logging.INFO)

# Cargar variables de entorno desde .env
load_dotenv()

# Usar solo SQLite local para este proyecto (tienda agrícola)
SQLITE_URI = "sqlite:///tienda.db"

def get_engine():
    """
    Retorna un engine conectado a SQLite local.
    """
    return create_engine(SQLITE_URI, echo=True)

# Crear engine y sesión global
engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos (debe ser importada por los modelos)
Base = declarative_base()

def get_db_session():
    """
    Retorna una nueva sesión de base de datos.
    Devuelve una instancia de Session. Es responsabilidad del llamador cerrarla.
    """
    return SessionLocal()


@contextmanager
def get_db():
    """Context manager para obtener y cerrar automáticamente una sesión.

    Uso:
        with get_db() as db:
            # usar db
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
