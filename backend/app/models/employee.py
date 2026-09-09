from sqlalchemy import Column, String, ForeignKey, Integer, Float
from sqlalchemy.orm import relationship
from app.db.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(100), ForeignKey("users.id"), primary_key=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    branch = Column(String(100), nullable=False)
    status = Column(String(50), default="active")
    joined_at = Column(String(50), nullable=False)

    user = relationship("User", backref="employee_profile")

class Salesperson(Base):
    __tablename__ = "salespersons"

    employee_id = Column(String(100), ForeignKey("employees.id"), primary_key=True)
    target = Column(Integer, default=0)
    achieved = Column(Integer, default=0)
    commission_rate = Column(Float, default=0.0)

    employee = relationship("Employee", backref="salesperson_profile")
    customers = relationship("BookRelation", back_populates="salesperson")
    
class Mechanic(Base):
    __tablename__ = "mechanics"

    employee_id = Column(String(100), ForeignKey("employees.id"), primary_key=True)
    specialization = Column(String(100), nullable=False)
    shift = Column(String(50), nullable=False)

    employee = relationship("Employee", backref="mechanic_profile")
    services = relationship("ServiceAssignment", back_populates="mechanic")

class Manager(Base):
    __tablename__ = "managers"

    employee_id = Column(String(100), ForeignKey("employees.id"), primary_key=True)
    managed_branch = Column(String(100), nullable=False)
    headcount = Column(Integer, default=0)

    employee = relationship("Employee", backref="manager_profile")
