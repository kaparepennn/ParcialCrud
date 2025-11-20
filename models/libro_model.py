from sqlalchemy import Column, Integer, String
from config.database import Base

class Libro(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    author = Column(String(150), nullable=True)
    isbn = Column(String(50), nullable=True)
    published_date = Column(String(50), nullable=True)
    pages = Column(Integer, nullable=True)
    description = Column(String(1000), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "isbn": self.isbn,
            "published_date": self.published_date,
            "pages": self.pages,
            "description": self.description
        }
