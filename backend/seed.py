import json
import os
from datetime import datetime
from app.db.database import SessionLocal
from app.models.user import User
from app.models.customer import Customer
from app.models.employee import Employee, Salesperson, Mechanic, Manager
from app.models.vehicle import Vehicle
from app.models.booking import Booking
from app.models.rental_agreement import RentalAgreement
from app.models.payment import Payment
from app.models.maintenance import MaintenanceRecord
from app.models.document import Document
from app.models.review import Review
from app.models.notification import Notification
from app.models.junctions import BookRelation, ServiceAssignment
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def parse_date(date_str):
    if not date_str:
        return datetime.utcnow()
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except:
        return datetime.utcnow()

def seed_data():
    db = SessionLocal()
    
    file_path = os.path.join(os.path.dirname(__file__), "seed_data.json")
    if not os.path.exists(file_path):
        print(f"Seed data not found at {file_path}")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Seed Employees (creates User then Employee)
    for emp_data in data.get("employees", []):
        existing = db.query(User).filter(User.id == emp_data["id"]).first()
        if existing:
            continue
            
        user = User(
            id=emp_data["id"],
            email=emp_data["email"],
            password_hash=hash_password("password123"),
            role=emp_data["role"]
        )
        db.add(user)
        
        emp = Employee(
            id=emp_data["id"],
            name=emp_data["name"],
            phone=emp_data["phone"],
            branch=emp_data["branch"],
            status=emp_data["status"],
            joined_at=emp_data["joinedAt"]
        )
        db.add(emp)
        
        if emp_data["role"] == "Salesperson":
            sales = Salesperson(
                employee_id=emp_data["id"],
                target=emp_data.get("target", 0),
                achieved=emp_data.get("achieved", 0),
                commission_rate=emp_data.get("commissionRate", 0.0)
            )
            db.add(sales)
        elif emp_data["role"] == "Mechanic":
            mech = Mechanic(
                employee_id=emp_data["id"],
                specialization=emp_data.get("specialization", ""),
                shift=emp_data.get("shift", "Morning")
            )
            db.add(mech)
        elif emp_data["role"] == "Manager":
            mgr = Manager(
                employee_id=emp_data["id"],
                managed_branch=emp_data.get("managedBranch", ""),
                headcount=emp_data.get("headcount", 0)
            )
            db.add(mgr)

    db.commit()

    # 2. Seed Customers
    for cust_data in data.get("customers", []):
        existing = db.query(User).filter(User.id == cust_data["id"]).first()
        if existing:
            continue
            
        user = User(
            id=cust_data["id"],
            email=cust_data["email"],
            password_hash=hash_password("password123"),
            role="Customer"
        )
        db.add(user)
        
        cust = Customer(
            id=cust_data["id"],
            name=cust_data["name"],
            phone=cust_data["phone"],
            dob=cust_data["dob"],
            license_number=cust_data["licenseNumber"],
            license_expiry=cust_data["licenseExpiry"],
            city=cust_data["city"],
            status=cust_data["status"],
            joined_at=cust_data["joinedAt"]
        )
        db.add(cust)

    db.commit()

    # 3. Seed Vehicles
    for veh_data in data.get("vehicles", []):
        existing = db.query(Vehicle).filter(Vehicle.id == veh_data["id"]).first()
        if existing:
            continue
            
        veh = Vehicle(
            id=veh_data["id"],
            name=veh_data["name"],
            make=veh_data["make"],
            model=veh_data["model"],
            year=veh_data["year"],
            registration=veh_data["registration"],
            category=veh_data["category"],
            fuel=veh_data["fuel"],
            transmission=veh_data["transmission"],
            seats=veh_data["seats"],
            mileage=veh_data.get("mileage", ""),
            price_per_day=veh_data["pricePerDay"],
            status=veh_data["status"],
            location=veh_data["location"],
            image=veh_data.get("image", ""),
            description=veh_data.get("description", ""),
            odometer_km=veh_data.get("odometerKm", 0),
            gallery=veh_data.get("gallery", []),
            features=veh_data.get("features", [])
        )
        db.add(veh)
    
    db.commit()

    # 4. Seed Bookings
    for b_data in data.get("bookings", []):
        existing = db.query(Booking).filter(Booking.id == b_data["id"]).first()
        if existing:
            continue
            
        b = Booking(
            id=b_data["id"],
            vehicle_id=b_data["vehicleId"],
            customer_id=b_data["customerId"],
            start_date=b_data["startDate"],
            end_date=b_data["endDate"],
            pickup_location=b_data["pickupLocation"],
            dropoff_location=b_data["dropoffLocation"],
            status=b_data["status"],
            subtotal=b_data.get("subtotal", 0.0),
            taxes=b_data.get("taxes", 0.0),
            insurance=b_data.get("insurance", 0.0),
            total=b_data["total"]
        )
        db.add(b)

    db.commit()

    # 5. Seed Rental Agreements
    for a_data in data.get("rentalAgreements", []):
        existing = db.query(RentalAgreement).filter(RentalAgreement.id == a_data["id"]).first()
        if existing:
            continue
            
        a = RentalAgreement(
            id=a_data["id"],
            booking_id=a_data["bookingId"],
            customer_id=a_data["customerId"],
            vehicle_id=a_data["vehicleId"],
            start_date=a_data["startDate"],
            end_date=a_data["endDate"],
            duration_days=a_data["durationDays"],
            amount=a_data["amount"],
            status=a_data["status"],
            signed_at=a_data.get("signedAt")
        )
        db.add(a)
    
    db.commit()

    # 6. Seed Payments
    for p_data in data.get("payments", []):
        existing = db.query(Payment).filter(Payment.id == p_data["id"]).first()
        if existing:
            continue
            
        p = Payment(
            id=p_data["id"],
            booking_id=p_data["bookingId"],
            customer_id=p_data["customerId"],
            amount=p_data["amount"],
            date=p_data["date"],
            method=p_data["method"],
            status=p_data["status"],
            reference=p_data["reference"]
        )
        db.add(p)
    
    db.commit()

    # 7. Seed Maintenance Records
    for m_data in data.get("maintenanceRecords", []):
        existing = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == m_data["id"]).first()
        if existing:
            continue
            
        m = MaintenanceRecord(
            id=m_data["id"],
            vehicle_id=m_data["vehicleId"],
            type=m_data["type"],
            description=m_data["description"],
            status=m_data["status"],
            scheduled_for=m_data["scheduledFor"],
            completed_at=m_data.get("completedAt"),
            cost=m_data["cost"],
            odometer_km=m_data["odometerKm"]
        )
        db.add(m)
        
    db.commit()

    # 8. Seed Documents
    for d_data in data.get("documents", []):
        existing = db.query(Document).filter(Document.id == d_data["id"]).first()
        if existing:
            continue
            
        d = Document(
            id=d_data["id"],
            customer_id=d_data["customerId"],
            booking_id=d_data.get("bookingId"),
            kind=d_data["kind"],
            title=d_data["title"],
            uploaded_at=d_data["uploadedAt"],
            status=d_data["status"],
            expires_at=d_data.get("expiresAt")
        )
        db.add(d)

    db.commit()

    # 9. Seed Reviews
    for r_data in data.get("reviews", []):
        existing = db.query(Review).filter(Review.id == r_data["id"]).first()
        if existing:
            continue
            
        r = Review(
            id=r_data["id"],
            vehicle_id=r_data["vehicleId"],
            customer_id=r_data["customerId"],
            rating=r_data["rating"],
            title=r_data["title"],
            body=r_data["body"]
        )
        db.add(r)
        
    db.commit()

    # 10. Seed Notifications
    for n_data in data.get("notifications", []):
        existing = db.query(Notification).filter(Notification.id == n_data["id"]).first()
        if existing:
            continue
            
        n = Notification(
            id=n_data["id"],
            user_id="C202", # notifications in mock might not have userId, default to someone
            kind=n_data["kind"],
            title=n_data["title"],
            body=n_data["body"],
            at=n_data["at"],
            read=n_data["read"]
        )
        db.add(n)
        
    db.commit()

    # 11. Seed Junctions
    for br_data in data.get("bookRelations", []):
        existing = db.query(BookRelation).filter(
            BookRelation.salesperson_id == br_data["salespersonId"],
            BookRelation.customer_id == br_data["customerId"],
            BookRelation.booking_id == br_data["bookingId"]
        ).first()
        if existing:
            continue
            
        br = BookRelation(
            salesperson_id=br_data["salespersonId"],
            customer_id=br_data["customerId"],
            booking_id=br_data["bookingId"],
            booked_on=br_data["bookedOn"],
            commission=br_data["commission"]
        )
        db.add(br)

    for sa_data in data.get("serviceAssignments", []):
        existing = db.query(ServiceAssignment).filter(
            ServiceAssignment.mechanic_id == sa_data["mechanicId"],
            ServiceAssignment.vehicle_id == sa_data["vehicleId"],
            ServiceAssignment.maintenance_id == sa_data["maintenanceId"]
        ).first()
        if existing:
            continue
            
        sa = ServiceAssignment(
            mechanic_id=sa_data["mechanicId"],
            vehicle_id=sa_data["vehicleId"],
            maintenance_id=sa_data["maintenanceId"],
            serviced_on=sa_data["servicedOn"],
            hours=sa_data["hours"]
        )
        db.add(sa)
        
    db.commit()

    print("Seed data applied successfully!")

if __name__ == "__main__":
    seed_data()
