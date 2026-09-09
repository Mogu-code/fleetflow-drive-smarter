from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.api import deps
from app.models.vehicle import Vehicle
from app.models.booking import Booking
from app.models.user import User
from app.schemas.vehicle import Vehicle as VehicleSchema, VehicleCreate, VehicleUpdate, VehicleAvailabilityResponse

router = APIRouter()

@router.get("/", response_model=List[VehicleSchema])
def read_vehicles(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    location: Optional[str] = None,
) -> Any:
    """
    Retrieve vehicles.
    """
    query = db.query(Vehicle)
    if category:
        query = query.filter(Vehicle.category == category)
    if location:
        query = query.filter(Vehicle.location.ilike(f"%{location}%"))
        
    vehicles = query.offset(skip).limit(limit).all()
    return vehicles

@router.get("/{id}", response_model=VehicleSchema)
def read_vehicle(
    id: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get vehicle by ID.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.get("/{id}/availability", response_model=VehicleAvailabilityResponse)
def check_vehicle_availability(
    id: str,
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Check if a vehicle is available for a given date range.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    try:
        # Just to validate format
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if start_date >= end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    # Check for overlapping active or confirmed bookings
    # Overlap occurs if: (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
    overlapping_booking = db.query(Booking).filter(
        Booking.vehicle_id == id,
        Booking.status.in_(["confirmed", "active", "pending"]),
        Booking.start_date < end_date,
        Booking.end_date > start_date
    ).first()

    if overlapping_booking:
        return {
            "vehicle_id": id,
            "available": False,
            "conflict_booking_id": overlapping_booking.id
        }

    return {
        "vehicle_id": id,
        "available": True,
        "conflict_booking_id": None
    }

@router.post("/", response_model=VehicleSchema)
def create_vehicle(
    *,
    db: Session = Depends(deps.get_db),
    vehicle_in: VehicleCreate,
    current_user: User = Depends(deps.require_role(["Manager", "Admin"]))
) -> Any:
    """
    Create new vehicle (Requires Manager role).
    """
    # Assuming UUID string generation for simplicity here, though our mock uses V101 format.
    import uuid
    vehicle = Vehicle(**vehicle_in.model_dump())
    vehicle.id = str(uuid.uuid4())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle
