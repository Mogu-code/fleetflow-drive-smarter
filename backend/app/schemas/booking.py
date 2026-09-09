from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class BookingBase(BaseModel):
    vehicle_id: str
    customer_id: str
    start_date: str
    end_date: str
    pickup_location: str
    dropoff_location: str
    status: str = "pending"
    subtotal: float = 0.0
    taxes: float = 0.0
    insurance: float = 0.0
    total: float = 0.0

class BookingCreate(BaseModel):
    vehicle_id: str
    # customer_id can be pulled from the authenticated user, but we'll accept it for now
    start_date: str
    end_date: str
    pickup_location: str
    dropoff_location: str
    
    subtotal: float
    taxes: float
    insurance: float
    total: float

class BookingUpdate(BaseModel):
    status: Optional[str] = None

class BookingInDBBase(BookingBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Booking(BookingInDBBase):
    pass
