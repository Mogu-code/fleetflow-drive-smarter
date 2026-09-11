from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class PaymentBase(BaseModel):
    booking_id: str
    customer_id: str
    amount: float
    date: str
    method: str
    status: str
    reference: str

class PaymentSchema(PaymentBase):
    id: str

    class Config:
        from_attributes = True

class MaintenanceBase(BaseModel):
    vehicle_id: str
    mechanic_id: str
    type: str
    description: str
    status: str
    scheduled_for: str
    completed_at: Optional[str] = None
    cost: float
    odometer_km: int

class MaintenanceSchema(MaintenanceBase):
    id: str

    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    vehicle_id: str
    customer_id: str
    rating: float
    title: str
    body: str

class ReviewSchema(ReviewBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    customer_id: str
    kind: str
    title: str
    status: str
    expires_at: Optional[str] = None

class DocumentSchema(DocumentBase):
    id: str
    uploaded_at: str

    class Config:
        from_attributes = True
