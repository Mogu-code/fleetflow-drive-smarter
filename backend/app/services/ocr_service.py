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
            
            # Smarter heuristics for parsing using regex across the entire text
            
            # 1. Extract Dates
            date_patterns = [
                r'\b\d{2}[-/]\d{2}[-/]\d{4}\b',
                r'\b\d{4}[-/]\d{2}[-/]\d{2}\b'
            ]
            found_dates = []
            for pattern in date_patterns:
                found_dates.extend(re.findall(pattern, extracted_text))
            
            parsed_dates = []
            for d in found_dates:
                try:
                    d_clean = d.replace('/', '-')
                    if len(d_clean.split('-')[0]) == 4:
                        parsed = datetime.strptime(d_clean, '%Y-%m-%d')
                    else:
                        parsed = datetime.strptime(d_clean, '%d-%m-%Y')
                    parsed_dates.append((d, parsed))
                except ValueError:
                    continue
            
            if parsed_dates:
                # Sort chronologically to find DOB (oldest) and Expiry (newest)
                parsed_dates.sort(key=lambda x: x[1])
                document.extracted_date_of_birth = parsed_dates[0][0]
                if len(parsed_dates) > 1:
                    document.extracted_expiry_date = parsed_dates[-1][0]
                else:
                    if parsed_dates[0][1] > datetime.utcnow():
                        document.extracted_expiry_date = parsed_dates[0][0]
                        document.extracted_date_of_birth = None
            
            # 2. Document Number
            exclude_words = {"DOCUMENT", "SAMPLE", "LICENSE", "GENERIC", "NUMBER", "STATE", "VALID", "EXPIRY"}
            for word in extracted_text.split():
                word_clean = word.replace(":", "").replace(",", "")
                # License numbers typically have numbers and uppercase letters and are 7-15 chars long
                if re.match(r'^[A-Z0-9-]{7,15}$', word_clean) and any(c.isdigit() for c in word_clean) and word_clean not in exclude_words:
                    document.extracted_document_number = word_clean
                    break
            
            # 3. Name Extraction
            # Try to find a Title Case name
            name_match = re.search(r'\b([A-Z][a-z]+ [A-Z][a-z]+)\b', extracted_text)
            if name_match and not any(w.upper() in exclude_words for w in name_match.group(1).split()):
                document.extracted_name = name_match.group(1)
            else:
                # Fallback to ALL CAPS name
                all_caps_match = re.search(r'\b([A-Z]{3,} [A-Z]{3,})\b', extracted_text)
                if all_caps_match and not any(w in exclude_words for w in all_caps_match.group(1).split()):
                    document.extracted_name = all_caps_match.group(1)

            document.ocr_status = "Processed"
            document.processed_at = datetime.utcnow()
            
        except Exception as e:
            print(f"OCR Error: {e}")
            document.ocr_status = "Failed"
            
        db.commit()
        db.refresh(document)
        return document
