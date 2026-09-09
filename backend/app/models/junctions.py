from sqlalchemy import Column, ForeignKey, Float, String, Integer
from sqlalchemy.orm import relationship
from app.db.database import Base

class BookRelation(Base):
    __tablename__ = "book_relations"

    salesperson_id = Column(String(100), ForeignKey("salespersons.employee_id"), primary_key=True)
    customer_id = Column(String(100), ForeignKey("customers.id"), primary_key=True)
    booking_id = Column(String(100), ForeignKey("bookings.id"), primary_key=True)
    
    booked_on = Column(String(50), nullable=False)
    commission = Column(Float, default=0.0)

    salesperson = relationship("Salesperson", back_populates="customers")
    customer = relationship("Customer", back_populates="salespersons")
    booking = relationship("Booking", back_populates="book_relations")

class ServiceAssignment(Base):
    __tablename__ = "service_assignments"

    mechanic_id = Column(String(100), ForeignKey("mechanics.employee_id"), primary_key=True)
    vehicle_id = Column(String(100), ForeignKey("vehicles.id"), primary_key=True)
    maintenance_id = Column(String(100), ForeignKey("maintenance_records.id"), primary_key=True)
    
    serviced_on = Column(String(50), nullable=False)
    hours = Column(Integer, default=0)

    mechanic = relationship("Mechanic", back_populates="services")
    vehicle = relationship("Vehicle", back_populates="mechanics")
    maintenance = relationship("MaintenanceRecord", back_populates="mechanics")
