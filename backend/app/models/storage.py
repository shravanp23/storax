from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base

class ActionType(str, enum.Enum):
    UPLOAD = "UPLOAD"
    DOWNLOAD = "DOWNLOAD"
    DELETE = "DELETE"
    LIST = "LIST"

class StorageObject(Base):
    __tablename__ = "storage_objects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    object_name = Column(String, nullable=False)
    object_key = Column(String, nullable=False)
    size_bytes = Column(Float, default=0)
    content_type = Column(String)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="objects")

class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(Enum(ActionType))
    object_key = Column(String)
    bytes_transferred = Column(Float, default=0)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="usage")
    class SharedLink(Base):
    __tablename__ = "shared_links"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    object_key = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)