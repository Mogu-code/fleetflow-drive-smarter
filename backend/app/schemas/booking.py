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
    start_date: str
    end_date: str
    pickup_location: str
    dropoff_location: str

class BookingUpdate(BaseModel):
    status: Optional[str] = None

class BookingInDBBase(BookingBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class Booking(BookingInDBBase):
    pass

class VehicleNested(BaseModel):
    id: str
    name: str
    category: str
    image: Optional[str] = None
    registration: str
    location: str

    class Config:
        from_attributes = True

class CustomerNested(BaseModel):
    id: str
    name: str
    phone: str

    class Config:
        from_attributes = True

class EmployeeNested(BaseModel):
    id: str
    name: str
    phone: str
    
    class Config:
        from_attributes = True

class BookingDetail(Booking):
    vehicle: Optional[VehicleNested] = None
    customer: Optional[CustomerNested] = None
    salesperson: Optional[EmployeeNested] = None
    payment_status: str = "Pending"
    document_status: str = "Missing"
    
    class Config:
        from_attributes = True
