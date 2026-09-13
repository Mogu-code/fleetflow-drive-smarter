from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    kind: str
    title: str
    booking_id: Optional[str] = None
    file_path: Optional[str] = None
    uploaded_at: str
    status: str = "pending"
    ocr_status: str = "Not processed"
    verification_status: str = "Pending Review"
    expires_at: Optional[str] = None
    
    extracted_text: Optional[str] = None
    extracted_name: Optional[str] = None
    extracted_document_number: Optional[str] = None
    extracted_date_of_birth: Optional[str] = None
    extracted_expiry_date: Optional[str] = None
    extracted_address: Optional[str] = None
    processed_at: Optional[datetime] = None

class DocumentCreate(DocumentBase):
    customer_id: str

class DocumentUpdate(BaseModel):
    status: Optional[str] = None
    ocr_status: Optional[str] = None
    verification_status: Optional[str] = None
    extracted_text: Optional[str] = None
    extracted_name: Optional[str] = None
    extracted_document_number: Optional[str] = None
    extracted_date_of_birth: Optional[str] = None
    extracted_expiry_date: Optional[str] = None
    extracted_address: Optional[str] = None
    processed_at: Optional[datetime] = None

class DocumentInDBBase(DocumentBase):
    id: str
    customer_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Document(DocumentInDBBase):
    pass

class DocumentDetail(Document):
    pass
