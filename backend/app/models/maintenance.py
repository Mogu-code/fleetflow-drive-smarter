import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(String(100), ForeignKey("vehicles.id"), nullable=False)
    
    type = Column(String(100), nullable=False)
    description = Column(String)
    status = Column(String(50), default="scheduled")
    scheduled_for = Column(String(50), nullable=False)
    completed_at = Column(String(50))
    cost = Column(Float, default=0.0)
    odometer_km = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="maintenance_records")
    mechanics = relationship("ServiceAssignment", back_populates="maintenance")
