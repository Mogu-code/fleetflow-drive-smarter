import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
