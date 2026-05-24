from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from app.models.storage import UsageLog, ActionType, StorageObject
from app.models.billing import Invoice, InvoiceStatus
from app.models.user import User
from app.config import settings

def calculate_bill(user_id: int, db: Session, period_start: datetime, period_end: datetime) -> dict:
    # Total storage used in bytes
    storage_bytes = db.query(func.sum(StorageObject.size_bytes))\
        .filter(StorageObject.user_id == user_id).scalar() or 0

    # Total requests in period
    total_requests = db.query(func.count(UsageLog.id))\
        .filter(UsageLog.user_id == user_id,
                UsageLog.timestamp >= period_start,
                UsageLog.timestamp <= period_end).scalar() or 0

    # Bandwidth (download bytes)
    bandwidth_bytes = db.query(func.sum(UsageLog.bytes_transferred))\
        .filter(UsageLog.user_id == user_id,
                UsageLog.action == ActionType.DOWNLOAD,
                UsageLog.timestamp >= period_start,
                UsageLog.timestamp <= period_end).scalar() or 0

    storage_gb = storage_bytes / (1024 ** 3)
    bandwidth_gb = bandwidth_bytes / (1024 ** 3)

    storage_cost = round(storage_gb * settings.PRICING_STORAGE_PER_GB, 4)
    request_cost = round((total_requests / 1000) * settings.PRICING_REQUESTS_PER_1000, 4)
    bandwidth_cost = round(bandwidth_gb * settings.PRICING_BANDWIDTH_PER_GB, 4)
    total = round(storage_cost + request_cost + bandwidth_cost, 4)

    return {
        "storage_gb": round(storage_gb, 6),
        "total_requests": total_requests,
        "bandwidth_gb": round(bandwidth_gb, 6),
        "storage_cost": storage_cost,
        "request_cost": request_cost,
        "bandwidth_cost": bandwidth_cost,
        "total_amount": total
    }

def generate_invoice(user_id: int, db: Session, period_start: datetime, period_end: datetime) -> Invoice:
    bill = calculate_bill(user_id, db, period_start, period_end)
    invoice = Invoice(
        user_id=user_id,
        period_start=period_start,
        period_end=period_end,
        **bill,
        status=InvoiceStatus.PENDING
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice