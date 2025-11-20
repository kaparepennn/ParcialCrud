import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
from models.usuario_model import User
from sqlalchemy.orm import Session

class UserRepository:
    """
    Repositorio para la gestión de usuarios en la base de datos.
    Proporciona métodos para crear, consultar, actualizar y eliminar usuarios.
    """

    def __init__(self, db_session: Session):
        self.db = db_session

    def get_all_users(self):
        logger.info("Obteniendo todos los usuarios desde el repositorio")
        return self.db.query(User).all()

    def get_user_by_id(self, user_id: int):
        logger.info(f"Buscando usuario por ID: {user_id}")
        return self.db.query(User).filter(User.id == user_id).first()

    def create_user(self, username: str, password: str, role: str = "cliente"):
        logger.info(f"Creando usuario: {username}")
        new_user = User(username=username, password=password, role=role)
        try:
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            return new_user
        except Exception as e:
            logger.error(f"Error al crear usuario: {e}")
            self.db.rollback()
            raise
    
    def update_user(self, user_id: int, username: str = None, password: str = None):
        user = self.get_user_by_id(user_id)
        if user:
            logger.info(f"Actualizando usuario: {user_id}")
            if username:
                user.username = username
            if password:
                user.password = password
            self.db.commit()
            self.db.refresh(user)
            return user
        logger.warning(f"Usuario no encontrado para actualizar: {user_id}")
        return None
    
    def delete_user(self, user_id: int):
        user = self.get_user_by_id(user_id)
        if user:
            logger.info(f"Eliminando usuario: {user_id}")
            self.db.delete(user)
            self.db.commit()
            return user
        logger.warning(f"Usuario no encontrado para eliminar: {user_id}")
        return None
