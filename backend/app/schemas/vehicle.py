from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime

class VehicleBase(BaseModel):
    name: str
    make: str
    model: str
    year: int
    registration: str
    category: str
    fuel: str
    transmission: str
    seats: int
    price_per_day: float
    status: str = "available"
    location: str
    
    mileage: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    odometer_km: Optional[int] = 0
    gallery: Optional[List[str]] = []
    features: Optional[List[str]] = []

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    registration: Optional[str] = None
    category: Optional[str] = None
    fuel: Optional[str] = None
    transmission: Optional[str] = None
    seats: Optional[int] = None
    price_per_day: Optional[float] = None
    status: Optional[str] = None
    location: Optional[str] = None
    mileage: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    odometer_km: Optional[int] = None
    gallery: Optional[List[str]] = None
    features: Optional[List[str]] = None

class VehicleInDBBase(VehicleBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Vehicle(VehicleInDBBase):
    pass

class VehicleAvailabilityResponse(BaseModel):
    vehicle_id: str
    available: bool
    conflict_booking_id: Optional[str] = None
