from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.booking import Booking
from app.models.vehicle import Vehicle
from app.schemas.booking import BookingCreate

class BookingService:
    @staticmethod
    def check_availability(db: Session, vehicle_id: str, start_date: str, end_date: str, exclude_booking_id: str = None) -> bool:
        """
        Returns True if vehicle is available, False otherwise.
        """
        query = db.query(Booking).filter(
            Booking.vehicle_id == vehicle_id,
            Booking.status.in_(["pending", "confirmed", "active"]),
            Booking.start_date < end_date,
            Booking.end_date > start_date
        )
        if exclude_booking_id:
            query = query.filter(Booking.id != exclude_booking_id)
            
        return query.first() is None

    @staticmethod
    def create_booking(db: Session, booking_in: BookingCreate, customer_id: str) -> Booking:
        vehicle = db.query(Vehicle).filter(Vehicle.id == booking_in.vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        try:
            start_dt = datetime.strptime(booking_in.start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(booking_in.end_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

        if start_dt >= end_dt:
            raise HTTPException(status_code=400, detail="start_date must be before end_date")

        # Backend double-booking protection
        is_available = BookingService.check_availability(
            db, 
            vehicle_id=booking_in.vehicle_id, 
            start_date=booking_in.start_date, 
            end_date=booking_in.end_date
        )
        if not is_available:
            raise HTTPException(status_code=409, detail="Vehicle is not available for the selected dates")

        import uuid
        booking = Booking(
            id=str(uuid.uuid4()),
            vehicle_id=booking_in.vehicle_id,
            customer_id=customer_id,
            start_date=booking_in.start_date,
            end_date=booking_in.end_date,
            pickup_location=booking_in.pickup_location,
            dropoff_location=booking_in.dropoff_location,
            status="pending",
            subtotal=booking_in.subtotal,
            taxes=booking_in.taxes,
            insurance=booking_in.insurance,
            total=booking_in.total,
            created_at=datetime.utcnow()
        )
        
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def confirm_booking(db: Session, booking_id: str, manager_id: str) -> Booking:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking.status != "pending":
            raise HTTPException(status_code=400, detail=f"Cannot confirm booking in status '{booking.status}'")
            
        booking.status = "confirmed"
        # In a real app we might link the manager_id here in some audit log
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def cancel_booking(db: Session, booking_id: str, customer_id: str) -> Booking:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
            
        # Ensure the user owns this booking or is an admin (simplified here to just check ownership)
        if booking.customer_id != customer_id:
            raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
            
        if booking.status not in ["pending", "confirmed"]:
            raise HTTPException(status_code=400, detail=f"Cannot cancel booking in status '{booking.status}'")
            
        booking.status = "cancelled"
        db.commit()
        db.refresh(booking)
        return booking
