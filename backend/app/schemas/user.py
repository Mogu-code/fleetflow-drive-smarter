from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str
    
    # Common customer/employee fields depending on role
    name: str
    phone: str
    
    # Customer specific
    dob: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[str] = None
    city: Optional[str] = None
    
    # Employee specific
    branch: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None

class UserInDBBase(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class CustomerBase(BaseModel):
    id: str
    name: str
    phone: str
    dob: str
    license_number: str
    license_expiry: str
    city: str
    status: str
    joined_at: str

    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    id: str
    name: str
    phone: str
    branch: str
    status: str
    joined_at: str

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
