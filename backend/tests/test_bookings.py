from fastapi.testclient import TestClient
from app.core.config import settings
from app.models.customer import Customer
from app.models.employee import Manager
from app.models.user import User
from app.core.security import get_password_hash
import uuid
import pytest

def create_test_customer(db):
    test_email = f"customer_{uuid.uuid4()}@example.com"
    test_password = "password123"
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=test_email,
        password_hash=get_password_hash(test_password),
        role="Customer"
    )
    db.add(user)
    db.commit()

    customer = Customer(
        id=user_id,
        name="Test Customer",
        phone="1234567890",
        dob="1990-01-01",
        license_number=f"LIC{uuid.uuid4()}",
        license_expiry="2030-01-01",
        city="Test City",
        joined_at="2023-01-01",
        status="active"
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return user, test_password

def create_test_manager(db):
    test_email = f"manager_{uuid.uuid4()}@example.com"
    test_password = "password123"
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=test_email,
        password_hash=get_password_hash(test_password),
        role="Manager"
    )
    db.add(user)
    db.commit()

    from app.models.employee import Employee
    employee = Employee(
        id=user_id,
        name="Test Manager",
        phone="0987654321",
        branch="Test Branch",
        status="active",
        joined_at="2023-01-01"
    )
    db.add(employee)
    db.commit()

    manager = Manager(
        employee_id=user_id,
        managed_branch="Test Branch",
        headcount=5
    )
    db.add(manager)
    db.commit()
    db.refresh(manager)
    return user, test_password

def get_token(client: TestClient, email: str, password: str):
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": email, "password": password}
    )
    return response.json()["access_token"]

def test_booking_workflow_and_validation(client: TestClient, db):
    # 1. Setup Users
    customer, c_pwd = create_test_customer(db)
    manager, m_pwd = create_test_manager(db)
    customer_token = get_token(client, customer.email, c_pwd)
    manager_token = get_token(client, manager.email, m_pwd)
    
    auth_headers = {"Authorization": f"Bearer {customer_token}"}
    manager_headers = {"Authorization": f"Bearer {manager_token}"}

    # Use a known vehicle from the seed data
    vehicle_id = "V101"

    # 2. Test Invalid Dates
    response = client.post(
        f"{settings.API_V1_STR}/bookings/",
        headers=auth_headers,
        json={
            "vehicle_id": vehicle_id,
            "start_date": "2030-05-10",
            "end_date": "2030-05-01",  # End date before start date
            "pickup_location": "Hub A",
            "dropoff_location": "Hub B",
            "subtotal": 1000,
            "taxes": 180,
            "insurance": 50,
            "total": 1230
        }
    )
    assert response.status_code == 400

    # 3. Test Nonexistent Vehicle
    response = client.post(
        f"{settings.API_V1_STR}/bookings/",
        headers=auth_headers,
        json={
            "vehicle_id": "INVALID_V999",
            "start_date": "2030-06-01",
            "end_date": "2030-06-05",
            "pickup_location": "Hub A",
            "dropoff_location": "Hub B",
            "subtotal": 1000, "taxes": 180, "insurance": 50, "total": 1230
        }
    )
    assert response.status_code == 404

    # 4. Successful Booking Creation
    booking_data = {
        "vehicle_id": vehicle_id,
        "start_date": "2030-06-01",
        "end_date": "2030-06-05",
        "pickup_location": "Hub A",
        "dropoff_location": "Hub B",
        "subtotal": 5000, "taxes": 900, "insurance": 200, "total": 6100
    }
    response = client.post(
        f"{settings.API_V1_STR}/bookings/",
        headers=auth_headers,
        json=booking_data
    )
    assert response.status_code == 200
    created_booking = response.json()
    assert created_booking["status"] == "pending"
    booking_id = created_booking["id"]

    # 5. Test Double-Booking Rejection
    overlap_data = booking_data.copy()
    overlap_data["start_date"] = "2030-06-02" # Overlaps existing booking
    response = client.post(
        f"{settings.API_V1_STR}/bookings/",
        headers=auth_headers,
        json=overlap_data
    )
    assert response.status_code == 409
    assert "not available" in response.json()["detail"]

    # 6. Test Foreign-Key Integrity / Fetching
    response = client.get(
        f"{settings.API_V1_STR}/bookings/{booking_id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["customer_id"] == customer.id

    # 7. Customer Ownership Validation
    other_customer, other_pwd = create_test_customer(db)
    other_token = get_token(client, other_customer.email, other_pwd)
    
    # Try fetching someone else's booking
    response = client.get(
        f"{settings.API_V1_STR}/bookings/{booking_id}",
        headers={"Authorization": f"Bearer {other_token}"}
    )
    assert response.status_code == 403

    # 8. Test Status Transitions: Customer tries to confirm (should fail)
    response = client.post(
        f"{settings.API_V1_STR}/bookings/{booking_id}/confirm",
        headers=auth_headers
    )
    assert response.status_code == 403 # Manager role required

    # Manager confirms booking
    response = client.post(
        f"{settings.API_V1_STR}/bookings/{booking_id}/confirm",
        headers=manager_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"

    # Customer cancels booking
    response = client.post(
        f"{settings.API_V1_STR}/bookings/{booking_id}/cancel",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"

    # Manager tries to confirm a cancelled booking (should fail)
    response = client.post(
        f"{settings.API_V1_STR}/bookings/{booking_id}/confirm",
        headers=manager_headers
    )
    assert response.status_code == 400
