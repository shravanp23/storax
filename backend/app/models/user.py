from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    bucket_name = Column(String, unique=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    objects = relationship("StorageObject", back_populates="owner")
    usage = relationship("UsageLog", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    api_keys = relationship("APIKey", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, __import__('sqlalchemy').ForeignKey("users.id"), index=True)
    name = Column(String, nullable=False)
    key = Column(String, unique=True, nullable=False, index=True)
    key_prefix = Column(String, nullable=False, index=True)
    is_active = Column(Boolean, default=True, index=True)
    permissions = Column(String, default="read_write")
    last_used = Column(DateTime, nullable=True)
    created_at = Column(DateTime, index=True, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="api_keys")