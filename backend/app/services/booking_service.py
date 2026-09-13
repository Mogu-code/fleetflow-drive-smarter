from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.booking import Booking
from app.models.vehicle import Vehicle
from app.models.employee import Salesperson
from app.models.junctions import BookRelation
from app.schemas.booking import BookingCreate

class BookingService:
    @staticmethod
    def check_availability(db: Session, vehicle_id: str, start_date: str, end_date: str, exclude_booking_id: str = None) -> bool:
        """
        Returns True if vehicle is available, False otherwise.
        """
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle or vehicle.status != "available":
            return False

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

        duration_days = (end_dt - start_dt).days
        if duration_days < 1:
            duration_days = 1

        subtotal = vehicle.price_per_day * duration_days
        taxes = subtotal * 0.18
        insurance = 0.0
        total = subtotal + taxes + insurance

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
            subtotal=subtotal,
            taxes=taxes,
            insurance=insurance,
            total=total,
            created_at=datetime.utcnow()
        )
        
        db.add(booking)

        # Assign salesperson
        from sqlalchemy import func
        salesperson = (
            db.query(Salesperson)
            .join(Salesperson.employee)
            .outerjoin(BookRelation, Salesperson.employee_id == BookRelation.salesperson_id)
            .filter(Salesperson.employee.has(status="active"))
            .group_by(Salesperson.employee_id)
            .order_by(func.count(BookRelation.booking_id).asc())
            .first()
        )
        if salesperson:
            book_relation = BookRelation(
                salesperson_id=salesperson.employee_id,
                customer_id=customer_id,
                booking_id=booking.id,
                booked_on=datetime.utcnow().strftime("%Y-%m-%d"),
                commission=total * (salesperson.commission_rate / 100.0) if salesperson.commission_rate else 0.0
            )
            db.add(book_relation)

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
