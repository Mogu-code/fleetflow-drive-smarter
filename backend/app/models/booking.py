import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(String(100), ForeignKey("vehicles.id"), nullable=False)
    customer_id = Column(String(100), ForeignKey("customers.id"), nullable=False)
    
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    pickup_location = Column(String(255), nullable=False)
    dropoff_location = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")
    
    subtotal = Column(Float, default=0.0)
    taxes = Column(Float, default=0.0)
    insurance = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="bookings")
    customer = relationship("Customer", back_populates="bookings")
    rental_agreement = relationship("RentalAgreement", back_populates="booking", uselist=False)
    payments = relationship("Payment", back_populates="booking")
    book_relations = relationship("BookRelation", back_populates="booking")

    @property
    def salesperson(self):
        if self.book_relations and len(self.book_relations) > 0:
            emp = self.book_relations[0].salesperson.employee
            if emp:
                return emp
        return None

    @property
    def payment_status(self):
        if self.payments and len(self.payments) > 0:
            return self.payments[-1].status
        return "Pending"

    @property
    def document_status(self):
        if self.customer and self.customer.documents:
            # Check the latest document status
            latest = sorted(self.customer.documents, key=lambda d: d.created_at, reverse=True)
            if latest:
                return latest[0].verification_status
        return "Missing"
