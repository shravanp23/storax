from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.models.user import User
from app.models.storage import StorageObject, UsageLog, ActionType, SharedLink
from app.services.auth_service import get_current_user
from app.services import minio_service
import uuid
import secrets

router = APIRouter()

@router.post("/upload")
def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    object_key = f"{uuid.uuid4().hex}_{file.filename}"
    size = minio_service.upload_file(
        current_user.bucket_name, object_key, file.file, file.content_type
    )
    obj = StorageObject(
        user_id=current_user.id,
        object_name=file.filename,
        object_key=object_key,
        size_bytes=size,
        content_type=file.content_type
    )
    db.add(obj)
    db.add(UsageLog(user_id=current_user.id, action=ActionType.UPLOAD,
                    object_key=object_key, bytes_transferred=size))
    db.commit()
    return {"message": "Uploaded successfully", "object_key": object_key,
            "filename": file.filename, "size_bytes": size}


@router.get("/files")
def list_files(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.add(UsageLog(user_id=current_user.id, action=ActionType.LIST, object_key="", bytes_transferred=0))
    db.commit()
    files = db.query(StorageObject).filter(StorageObject.user_id == current_user.id).all()
    return [{"id": f.id, "filename": f.object_name, "object_key": f.object_key,
             "size_bytes": f.size_bytes, "content_type": f.content_type,
             "uploaded_at": f.uploaded_at} for f in files]


@router.get("/download/{object_key}")
def download_file(object_key: str, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    obj = db.query(StorageObject).filter(
        StorageObject.object_key == object_key,
        StorageObject.user_id == current_user.id
    ).first()
    if not obj:
        raise HTTPException(status_code=404, detail="File not found")
    body, size, content_type = minio_service.download_file(current_user.bucket_name, object_key)
    db.add(UsageLog(user_id=current_user.id, action=ActionType.DOWNLOAD,
                    object_key=object_key, bytes_transferred=size))
    db.commit()
    return StreamingResponse(body, media_type=content_type,
                             headers={"Content-Disposition": f"attachment; filename={obj.object_name}"})


@router.delete("/delete/{object_key}")
def delete_file(object_key: str, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    obj = db.query(StorageObject).filter(
        StorageObject.object_key == object_key,
        StorageObject.user_id == current_user.id
    ).first()
    if not obj:
        raise HTTPException(status_code=404, detail="File not found")
    minio_service.delete_file(current_user.bucket_name, object_key)
    db.delete(obj)
    db.add(UsageLog(user_id=current_user.id, action=ActionType.DELETE,
                    object_key=object_key, bytes_transferred=0))
    db.commit()
    return {"message": "File deleted successfully"}


@router.get("/usage")
def get_usage(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import func
    total_bytes = db.query(func.sum(StorageObject.size_bytes))\
        .filter(StorageObject.user_id == current_user.id).scalar() or 0
    total_files = db.query(StorageObject).filter(StorageObject.user_id == current_user.id).count()
    total_requests = db.query(UsageLog).filter(UsageLog.user_id == current_user.id).count()
    return {
        "total_files": total_files,
        "total_bytes": total_bytes,
        "total_gb": round(total_bytes / (1024**3), 6),
        "total_requests": total_requests
    }


@router.post("/share/{object_key}")
def create_share_link(
    object_key: str,
    hours: int = 24,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    obj = db.query(StorageObject).filter(
        StorageObject.object_key == object_key,
        StorageObject.user_id == current_user.id
    ).first()
    if not obj:
        raise HTTPException(status_code=404, detail="File not found")

    db.query(SharedLink).filter(
        SharedLink.object_key == object_key,
        SharedLink.user_id == current_user.id
    ).delete()

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=hours)

    link = SharedLink(
        user_id=current_user.id,
        object_key=object_key,
        filename=obj.object_name,
        token=token,
        expires_at=expires_at
    )
    db.add(link)
    db.commit()

    return {
        "share_url": f"https://storax.onrender.com/api/storage/shared/{token}",
        "expires_at": expires_at,
        "filename": obj.object_name,
        "hours": hours
    }


@router.get("/shared/{token}")
def access_shared_file(token: str, db: Session = Depends(get_db)):
    link = db.query(SharedLink).filter(
        SharedLink.token == token,
        SharedLink.is_active == True
    ).first()

    if not link:
        raise HTTPException(status_code=404, detail="Link not found or expired")

    if datetime.now(timezone.utc) > link.expires_at.replace(tzinfo=timezone.utc):
        link.is_active = False
        db.commit()
        raise HTTPException(status_code=410, detail="Link has expired")

    user = db.query(User).filter(User.id == link.user_id).first()
    body, size, content_type = minio_service.download_file(
        user.bucket_name, link.object_key
    )

    return StreamingResponse(
        body,
        media_type=content_type,
        headers={"Content-Disposition": f"attachment; filename={link.filename}"}
    )


@router.get("/my-shares")
def get_my_shares(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    links = db.query(SharedLink).filter(
        SharedLink.user_id == current_user.id,
        SharedLink.is_active == True
    ).all()
    now = datetime.now(timezone.utc)
    return [{
        "id": l.id,
        "filename": l.filename,
        "object_key": l.object_key,
        "share_url": f"https://storax.onrender.com/api/storage/shared/{l.token}",
        "expires_at": l.expires_at,
        "is_expired": now > l.expires_at.replace(tzinfo=timezone.utc)
    } for l in links]


@router.delete("/share/{object_key}")
def delete_share_link(
    object_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(SharedLink).filter(
        SharedLink.object_key == object_key,
        SharedLink.user_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "Share link deleted"}