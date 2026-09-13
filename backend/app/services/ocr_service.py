import os
import re
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.document import Document
import easyocr

class OCRService:
    reader = None

    @classmethod
    def get_reader(cls):
        if cls.reader is None:
            # Initialize reader with English. This downloads models if not present.
            cls.reader = easyocr.Reader(['en'])
        return cls.reader

    @classmethod
    def process_document(cls, db: Session, document_id: str):
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document or not document.file_path:
            return None

        # Update status
        document.ocr_status = "Processing"
        db.commit()

        try:
            reader = cls.get_reader()
            results = reader.readtext(document.file_path)
            
            # Combine all text
            extracted_text = " ".join([res[1] for res in results])
            
            document.extracted_text = extracted_text
            
            # Basic heuristics for parsing
            lines = [res[1] for res in results]
            
            # Very basic extraction logic
            for i, line in enumerate(lines):
                line_lower = line.lower()
                
                if "dob" in line_lower or "birth" in line_lower:
                    # Look for date pattern in current or next line
                    date_match = re.search(r'\d{2}[-/]\d{2}[-/]\d{4}', line)
                    if date_match:
                        document.extracted_date_of_birth = date_match.group(0)
                    elif i + 1 < len(lines):
                        next_match = re.search(r'\d{2}[-/]\d{2}[-/]\d{4}', lines[i+1])
                        if next_match:
                            document.extracted_date_of_birth = next_match.group(0)
                            
                elif "name" in line_lower and "father" not in line_lower:
                    if i + 1 < len(lines):
                        # Assuming name is the next line
                        document.extracted_name = lines[i+1][:255]
                        
                elif "exp" in line_lower or "valid till" in line_lower:
                    date_match = re.search(r'\d{2}[-/]\d{2}[-/]\d{4}', line)
                    if date_match:
                        document.extracted_expiry_date = date_match.group(0)
                    elif i + 1 < len(lines):
                        next_match = re.search(r'\d{2}[-/]\d{2}[-/]\d{4}', lines[i+1])
                        if next_match:
                            document.extracted_expiry_date = next_match.group(0)
                            
            # Document Number: Look for typical alphanumeric patterns
            for line in lines:
                if re.match(r'^[A-Z0-9-]{6,15}$', line.replace(" ", "")):
                    if not document.extracted_document_number:
                        document.extracted_document_number = line
                        break

            document.ocr_status = "Processed"
            document.processed_at = datetime.utcnow()
            
        except Exception as e:
            print(f"OCR Error: {e}")
            document.ocr_status = "Failed"
            
        db.commit()
        db.refresh(document)
        return document
