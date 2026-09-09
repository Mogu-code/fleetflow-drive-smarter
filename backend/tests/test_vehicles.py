from fastapi.testclient import TestClient
from app.core.config import settings

def test_read_vehicles(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/vehicles/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0 # Seed data should have populated vehicles

def test_read_vehicle(client: TestClient):
    # Try fetching V101 which exists in seed data
    response = client.get(f"{settings.API_V1_STR}/vehicles/V101")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "V101"

def test_read_nonexistent_vehicle(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/vehicles/INVALID_ID_999")
    assert response.status_code == 404

def test_vehicle_availability_available(client: TestClient):
    # Checking availability for dates far in the future
    response = client.get(
        f"{settings.API_V1_STR}/vehicles/V101/availability",
        params={"start_date": "2030-01-01", "end_date": "2030-01-10"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["available"] is True
    assert data["conflict_booking_id"] is None

def test_vehicle_availability_invalid_dates(client: TestClient):
    # End date before start date
    response = client.get(
        f"{settings.API_V1_STR}/vehicles/V101/availability",
        params={"start_date": "2030-01-10", "end_date": "2030-01-01"}
    )
    assert response.status_code == 400
