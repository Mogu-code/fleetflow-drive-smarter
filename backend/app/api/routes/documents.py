import os
import shutil
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime

from app.api import deps
from app.models.document import Document
from app.models.user import User
from app.models.junctions import BookRelation
from app.schemas.document import DocumentDetail, DocumentCreate
from app.services.ocr_service import OCRService

router = APIRouter()

UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[DocumentDetail])
def read_documents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve documents.
    Customers see their own.
    Salespersons see documents for customers they have bookings with.
    Managers see all.
    """
    if current_user.role in ["Manager", "Admin"]:
        documents = db.query(Document).offset(skip).limit(limit).all()
    elif current_user.role == "Salesperson":
        # Get customers handled by this salesperson
        customer_ids = [br.customer_id for br in db.query(BookRelation.customer_id).filter(BookRelation.salesperson_id == current_user.id).all()]
        documents = db.query(Document).filter(Document.customer_id.in_(customer_ids)).offset(skip).limit(limit).all()
    else:
        documents = db.query(Document).filter(Document.customer_id == current_user.id).offset(skip).limit(limit).all()
    return documents

@router.post("/", response_model=DocumentDetail)
def upload_document(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    kind: str,
    title: str,
    booking_id: str = None,
    current_user: User = Depends(deps.require_role(["Customer"]))
) -> Any:
    """
    Upload a new document.
    """
    if not file.content_type.startswith("image/") and file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type")

    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{file_extension}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    doc = Document(
        customer_id=current_user.id,
        booking_id=booking_id,
        kind=kind,
        title=title,
        file_path=file_path,
        uploaded_at=datetime.utcnow().strftime("%Y-%m-%d")
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    return doc

@router.post("/{id}/process-ocr", response_model=DocumentDetail)
def process_document_ocr(
    *,
    id: str,
    db: Session = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Trigger OCR processing for a document.
    """
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if current_user.role == "Customer" and doc.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    # Process synchronously for simplicity, or we could use background_tasks.add_task(OCRService.process_document, db, id)
    # Using synchronous so it returns immediately with data for the demo, but in production use background.
    doc = OCRService.process_document(db, id)
    
    return doc
