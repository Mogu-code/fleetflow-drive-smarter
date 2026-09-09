import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(100), ForeignKey("users.id"), nullable=False)
    
    kind = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(String, nullable=False)
    at = Column(String(50), nullable=False)
    read = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
