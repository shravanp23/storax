from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.storage import StorageObject, UsageLog
from app.models.billing import Invoice
from app.services.auth_service import get_admin_user

router = APIRouter()

@router.get("/stats")
def platform_stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    total_users = db.query(User).count()
    total_files = db.query(StorageObject).count()
    total_bytes = db.query(func.sum(StorageObject.size_bytes)).scalar() or 0
    total_requests = db.query(UsageLog).count()
    total_revenue = db.query(func.sum(Invoice.total_amount)).scalar() or 0
    return {
        "total_users": total_users,
        "total_files": total_files,
        "total_storage_gb": round(total_bytes / (1024**3), 4),
        "total_requests": total_requests,
        "total_revenue": round(total_revenue, 2)
    }

@router.get("/users")
def all_users(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    users = db.query(User).all()
    result = []
    for u in users:
        files = db.query(StorageObject).filter(StorageObject.user_id == u.id).count()
        storage = db.query(func.sum(StorageObject.size_bytes))\
            .filter(StorageObject.user_id == u.id).scalar() or 0
        result.append({
            "id": u.id, "full_name": u.full_name, "email": u.email,
            "is_active": u.is_active, "is_admin": u.is_admin,
            "bucket_name": u.bucket_name, "created_at": u.created_at,
            "total_files": files, "storage_bytes": storage
        })
    return result