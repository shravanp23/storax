from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.storage import StorageObject, UsageLog
from app.models.billing import Invoice
from app.services.auth_service import get_admin_user

router = APIRouter()

class BroadcastEmailRequest(BaseModel):
    subject: str
    message: str

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
        storage = db.query(func.sum(StorageObject.size_bytes)).filter(StorageObject.user_id == u.id).scalar() or 0
        result.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "bucket_name": u.bucket_name,
            "created_at": u.created_at,
            "total_files": files,
            "storage_bytes": storage
        })
    return result

@router.post("/broadcast-email")
def broadcast_email(
    request: BroadcastEmailRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    users = db.query(User).filter(User.is_active == True).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found")

    emails = [u.email for u in users if u.email]
    results = []

    for email in emails:
        try:
            from app.services.email_service import send_email
            html = f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0F172A;color:#E8E8F0;padding:40px;border-radius:16px;">
                <h1 style="color:#6C63FF;font-size:28px;margin:0 0 24px;">⚡ StoraX</h1>
                <h2 style="color:#E8E8F0;margin:0 0 16px;">{request.subject}</h2>
                <div style="background:#1E1E3A;border-radius:12px;padding:24px;border-left:4px solid #6C63FF;">
                    <p style="color:#E8E8F0;line-height:1.8;margin:0;white-space:pre-line;">{request.message}</p>
                </div>
                <p style="color:#9999BB;font-size:13px;margin-top:24px;">— {admin.full_name}, StoraX Admin Team</p>
                <a href="https://storax-5vt3.vercel.app/dashboard" style="display:inline-block;background:#6C63FF;color:white;padding:12px 28px;border-radius:100px;text-decoration:none;font-weight:bold;margin-top:24px;">Go to StoraX →</a>
                <p style="color:#9999BB;font-size:11px;text-align:center;margin-top:32px;">StoraX © 2026</p>
            </div>
            """
            success = send_email(email, request.subject, html)
            results.append({"email": email, "sent": success})
        except Exception as e:
            results.append({"email": email, "sent": False, "error": str(e)})

    sent = sum(1 for r in results if r.get("sent"))
    failed = len(results) - sent

    return {
        "message": "Broadcast complete",
        "total_users": len(emails),
        "sent": sent,
        "failed": failed,
        "results": results
    }
    @router.get("/test-email")
def test_email(admin: User = Depends(get_admin_user)):
    try:
        from app.services.email_service import send_email
        result = send_email(
            admin.email,
            "StoraX Email Test ✅",
            "<h1>Email is working!</h1><p>Your StoraX email configuration is correct.</p>"
        )
        return {"success": result, "sent_to": admin.email}
    except Exception as e:
        return {"success": False, "error": str(e)}