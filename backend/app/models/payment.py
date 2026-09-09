import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(100), ForeignKey("bookings.id"), nullable=False)
    customer_id = Column(String(100), ForeignKey("customers.id"), nullable=False)
    
    amount = Column(Float, nullable=False)
    date = Column(String(50), nullable=False)
    method = Column(String(50), nullable=False)
    status = Column(String(50), default="pending")
    reference = Column(String(100), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")
