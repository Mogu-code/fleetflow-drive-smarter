from fastapi.testclient import TestClient
from app.core.config import settings

def test_health_check(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "ok"

def test_login_invalid_credentials(client: TestClient):
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": "nonexistent@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 400

def test_login_and_me(client: TestClient, db):
    # Setup test user (assuming a user was seeded or we create one here)
    from app.models.user import User
    from app.core.security import get_password_hash
    import uuid

    test_email = f"test_{uuid.uuid4()}@example.com"
    test_password = "testpassword123"
    
    user = User(
        id=str(uuid.uuid4()),
        email=test_email,
        password_hash=get_password_hash(test_password),
        role="Customer"
    )
    db.add(user)
    db.commit()

    # Test login
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": test_email, "password": test_password}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]

    # Test /me
    me_response = client.get(
        f"{settings.API_V1_STR}/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == test_email
    assert me_data["role"] == "Customer"

def test_protected_endpoint_without_token(client: TestClient):
    response = client.get(f"{settings.API_V1_STR}/auth/me")
    assert response.status_code == 401
