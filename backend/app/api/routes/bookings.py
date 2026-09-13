from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.booking import Booking
from app.models.junctions import BookRelation
from app.models.user import User
from app.schemas.booking import BookingDetail, BookingCreate
from app.services.booking_service import BookingService

router = APIRouter()

@router.get("/", response_model=List[BookingDetail])
def read_bookings(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve bookings. Customers see their own, Managers see all, Salespersons see assigned.
    """
    if current_user.role in ["Manager", "Admin"]:
        bookings = db.query(Booking).offset(skip).limit(limit).all()
    elif current_user.role == "Salesperson":
        bookings = db.query(Booking).join(BookRelation).filter(BookRelation.salesperson_id == current_user.id).offset(skip).limit(limit).all()
    else:
        bookings = db.query(Booking).filter(Booking.customer_id == current_user.id).offset(skip).limit(limit).all()
    return bookings

@router.get("/{id}", response_model=BookingDetail)
def read_booking(
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Get booking by ID.
    """
    booking = db.query(Booking).filter(Booking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if current_user.role not in ["Manager", "Admin"]:
        if current_user.role == "Salesperson":
            if not any(br.salesperson_id == current_user.id for br in booking.book_relations):
                raise HTTPException(status_code=403, detail="Not enough permissions")
        elif booking.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return booking

@router.post("/", response_model=BookingDetail)
def create_booking(
    *,
    db: Session = Depends(deps.get_db),
    booking_in: BookingCreate,
    current_user: User = Depends(deps.require_role(["Customer"]))
) -> Any:
    """
    Create new booking.
    """
    booking = BookingService.create_booking(db=db, booking_in=booking_in, customer_id=current_user.id)
    return booking

@router.post("/{id}/confirm", response_model=BookingDetail)
def confirm_booking(
    *,
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_role(["Manager", "Admin"]))
) -> Any:
    """
    Confirm a booking. Only Managers/Admins can confirm.
    """
    booking = BookingService.confirm_booking(db=db, booking_id=id, manager_id=current_user.id)
    return booking

@router.post("/{id}/cancel", response_model=BookingDetail)
def cancel_booking(
    *,
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Cancel a booking.
    """
    # Using customer cancellation logic. If manager, we might bypass the check, but for now we enforce customer ID matches unless we expand the service.
    # We will let the service handle it, passing current_user.id
    booking = BookingService.cancel_booking(db=db, booking_id=id, customer_id=current_user.id)
    return booking
