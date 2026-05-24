from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base

class InvoiceStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    OVERDUE = "OVERDUE"

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    storage_gb = Column(Float, default=0)
    total_requests = Column(Integer, default=0)
    bandwidth_gb = Column(Float, default=0)
    storage_cost = Column(Float, default=0)
    request_cost = Column(Float, default=0)
    bandwidth_cost = Column(Float, default=0)
    total_amount = Column(Float, default=0)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.PENDING)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="invoices")