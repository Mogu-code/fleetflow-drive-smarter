import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(100), ForeignKey("customers.id"), nullable=False)
    booking_id = Column(String(100), ForeignKey("bookings.id"), nullable=True)
    
    kind = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    uploaded_at = Column(String(50), nullable=False)
    status = Column(String(50), default="pending")
    expires_at = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="documents")
    booking = relationship("Booking")
