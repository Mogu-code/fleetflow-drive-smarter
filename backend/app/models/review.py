import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Integer, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(String(100), ForeignKey("vehicles.id"), nullable=False)
    customer_id = Column(String(100), ForeignKey("customers.id"), nullable=False)
    
    rating = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="reviews")
    customer = relationship("Customer", back_populates="reviews")
