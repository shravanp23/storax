from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.storage import AuditLog
from app.services.auth_service import get_current_user, get_admin_user
from datetime import datetime, timezone

router = APIRouter()

def log_action(
    db: Session,
    user_id: int,
    action: str,
    resource: str = None,
    details: str = None,
    ip_address: str = None,
    user_agent: str = None,
    status: str = "success"
):
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Audit log error: {e}")

@router.get("/my-logs")
def get_my_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(AuditLog).filter(
        AuditLog.user_id == current_user.id
    ).order_by(AuditLog.timestamp.desc()).limit(50).all()

    return [{
        "id": l.id,
        "action": l.action,
        "resource": l.resource,
        "details": l.details,
        "status": l.status,
        "timestamp": l.timestamp
    } for l in logs]

@router.get("/admin/all-logs")
def get_all_audit_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    logs = db.query(AuditLog).order_by(
        AuditLog.timestamp.desc()
    ).limit(500).all()

    users = {u.id: u for u in db.query(User).all()}

    return [{
        "id": l.id,
        "user_id": l.user_id,
        "user_name": users.get(l.user_id, User()).full_name if l.user_id else "Unknown",
        "user_email": users.get(l.user_id, User()).email if l.user_id else "Unknown",
        "action": l.action,
        "resource": l.resource,
        "details": l.details,
        "ip_address": l.ip_address,
        "status": l.status,
        "timestamp": l.timestamp
    } for l in logs]