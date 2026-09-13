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
    file_path = Column(String(500), nullable=True)
    uploaded_at = Column(String(50), nullable=False)
    status = Column(String(50), default="pending")
    ocr_status = Column(String(50), default="Not processed")
    verification_status = Column(String(50), default="Pending Review")
    
    extracted_text = Column(String, nullable=True)
    extracted_name = Column(String(255), nullable=True)
    extracted_document_number = Column(String(255), nullable=True)
    extracted_date_of_birth = Column(String(50), nullable=True)
    extracted_expiry_date = Column(String(50), nullable=True)
    extracted_address = Column(String(500), nullable=True)
    processed_at = Column(DateTime, nullable=True)
    
    expires_at = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="documents")
    booking = relationship("Booking")

