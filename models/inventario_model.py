from sqlalchemy import Column, Integer, String
from config.database import Base

class Inventario(Base):
    __tablename__ = "inventario"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    cantidad = Column(Integer, nullable=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "cantidad": self.cantidad
        }
