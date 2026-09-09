from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(100), ForeignKey("users.id"), primary_key=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    dob = Column(String(50), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    license_expiry = Column(String(50), nullable=False)
    city = Column(String(100), nullable=False)
    status = Column(String(50), default="active")
    joined_at = Column(String(50), nullable=False)

    user = relationship("User", backref="customer_profile")
    
    bookings = relationship("Booking", back_populates="customer")
    documents = relationship("Document", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")
    reviews = relationship("Review", back_populates="customer")
    rental_agreements = relationship("RentalAgreement", back_populates="customer")
    salespersons = relationship("BookRelation", back_populates="customer")
