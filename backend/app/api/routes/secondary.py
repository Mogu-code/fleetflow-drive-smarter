from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.payment import Payment
from app.models.maintenance import MaintenanceRecord
from app.schemas.secondary import PaymentSchema, MaintenanceSchema

router = APIRouter()

@router.get("/payments", response_model=List[PaymentSchema])
def read_payments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(deps.get_current_user)
) -> Any:
    if current_user.role in ["Manager", "Admin"]:
        return db.query(Payment).offset(skip).limit(limit).all()
    return db.query(Payment).filter(Payment.customer_id == current_user.id).offset(skip).limit(limit).all()

@router.get("/maintenance", response_model=List[MaintenanceSchema])
def read_maintenance(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(deps.require_role(["Manager", "Admin", "Mechanic"]))
) -> Any:
    return db.query(MaintenanceRecord).offset(skip).limit(limit).all()
