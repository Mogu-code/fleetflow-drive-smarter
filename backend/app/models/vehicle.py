import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    registration = Column(String(100), unique=True, nullable=False)
    category = Column(String(50), nullable=False)
    fuel = Column(String(50), nullable=False)
    transmission = Column(String(50), nullable=False)
    seats = Column(Integer, nullable=False)
    mileage = Column(String(50))
    price_per_day = Column(Float, nullable=False)
    status = Column(String(50), default="available")
    location = Column(String(255), nullable=False)
    image = Column(String(255))
    description = Column(String)
    odometer_km = Column(Integer, default=0)
    
    gallery = Column(JSONB, default=list)
    features = Column(JSONB, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = relationship("Booking", back_populates="vehicle")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle")
    reviews = relationship("Review", back_populates="vehicle")
    rental_agreements = relationship("RentalAgreement", back_populates="vehicle")
    mechanics = relationship("ServiceAssignment", back_populates="vehicle")
