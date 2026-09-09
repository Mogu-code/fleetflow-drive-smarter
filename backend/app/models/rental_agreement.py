import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base

class RentalAgreement(Base):
    __tablename__ = "rental_agreements"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(100), ForeignKey("bookings.id"), nullable=False, unique=True)
    customer_id = Column(String(100), ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(String(100), ForeignKey("vehicles.id"), nullable=False)
    
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    duration_days = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="draft")
    signed_at = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="rental_agreement")
    customer = relationship("Customer", back_populates="rental_agreements")
    vehicle = relationship("Vehicle", back_populates="rental_agreements")
