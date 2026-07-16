from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.models.user import User
from app.models.storage import StorageObject, UsageLog, ActionType, SharedLink
from app.services.auth_service import get_current_user
from app.services import minio_service
from app.routers.auditlogs import log_action
from app.services.compression_service import get_compression_recommendation, compress_image, compress_pdf
from pydantic import BaseModel as PydanticBaseModel
import uuid
import secrets
import io

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
    # Send upload confirmation email
    try:
        from app.services.email_service import send_upload_confirmation_email
        send_upload_confirmation_email(
            current_user.email,
            current_user.full_name,
            file.filename,
            size,
            current_user.bucket_name
        )
    except Exception as e:
        print(f"Upload email error: {e}")

    # Check storage warning (80% of 1GB)
    try:
        from sqlalchemy import func
        total_bytes = db.query(func.sum(StorageObject.size_bytes))\
            .filter(StorageObject.user_id == current_user.id).scalar() or 0
        limit_bytes = 1 * 1024 * 1024 * 1024  # 1GB
        percent = (total_bytes / limit_bytes) * 100
        if percent >= 80:
            from app.services.email_service import send_storage_warning_email
            send_storage_warning_email(
                current_user.email,
                current_user.full_name,
                total_bytes / (1024**3),
                1.0,
                percent
            )
    except Exception as e:
        print(f"Storage warning email error: {e}")
    log_action(db, current_user.id, "FILE_UPLOAD", object_key, f"Uploaded: {file.filename} ({size} bytes)")
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
    log_action(db, current_user.id, "FILE_DOWNLOAD", object_key, f"Downloaded: {obj.object_name}")
    log_action(db, current_user.id, "FILE_DOWNLOAD", object_key, f"Downloaded: {obj.object_name} ({size} bytes)")
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
    log_action(db, current_user.id, "FILE_DELETE", object_key, f"Deleted: {obj.object_name}")
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
    log_action(db, current_user.id, "SHARE_LINK_CREATED", object_key, f"Share link created for: {obj.object_name}, expires: {expires_at}")

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

@router.get("/compression-recommendation/{object_key}")
def get_compression_advice(
    object_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    obj = db.query(StorageObject).filter(
        StorageObject.object_key == object_key,
        StorageObject.user_id == current_user.id
    ).first()
    if not obj:
        raise HTTPException(status_code=404, detail="File not found")

    recommendation = get_compression_recommendation(
        obj.object_name,
        obj.content_type,
        obj.size_bytes
    )

    savings_bytes = obj.size_bytes - recommendation["estimated_new_size_bytes"]
    savings_mb = savings_bytes / (1024 * 1024)
    cost_saving = (savings_bytes / (1024**3)) * settings.PRICING_STORAGE_PER_GB

    return {
        **recommendation,
        "filename": obj.object_name,
        "current_size_bytes": obj.size_bytes,
        "current_size_mb": round(obj.size_bytes / (1024*1024), 3),
        "estimated_savings_mb": round(savings_mb, 3),
        "estimated_cost_saving_per_month": round(cost_saving, 6),
        "object_key": object_key
    }


@router.post("/compress/{object_key}")
def compress_file(
    object_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    obj = db.query(StorageObject).filter(
        StorageObject.object_key == object_key,
        StorageObject.user_id == current_user.id
    ).first()
    if not obj:
        raise HTTPException(status_code=404, detail="File not found")

    recommendation = get_compression_recommendation(
        obj.object_name,
        obj.content_type,
        obj.size_bytes
    )

    if not recommendation["should_compress"]:
        raise HTTPException(status_code=400, detail="File is already optimized. No compression needed.")

    if not recommendation["compression_type"] in ["image_jpeg", "image_png", "pdf"]:
        raise HTTPException(status_code=400, detail="Compression not supported for this file type yet.")

    try:
        # Download original file
        body, size, content_type = minio_service.download_file(
            current_user.bucket_name, object_key
        )
        original_data = body.read()
        original_size = len(original_data)

        # Compress based on type
        if recommendation["compression_type"] in ["image_jpeg", "image_png"]:
            compressed_data, new_size = compress_image(original_data, content_type)
            new_content_type = "image/jpeg"
            new_filename = obj.object_name.rsplit('.', 1)[0] + '_compressed.jpg'
        elif recommendation["compression_type"] == "pdf":
            compressed_data, new_size = compress_pdf(original_data)
            new_content_type = "application/pdf"
            new_filename = obj.object_name.rsplit('.', 1)[0] + '_compressed.pdf'

        # Only save if actually smaller
        if new_size >= original_size:
            raise HTTPException(status_code=400, detail="Compression did not reduce file size. Original file kept.")

        # Upload compressed version
        new_object_key = f"{uuid.uuid4().hex}_compressed_{new_filename}"
        compressed_io = io.BytesIO(compressed_data)
        minio_service.upload_file(
            current_user.bucket_name,
            new_object_key,
            compressed_io,
            new_content_type
        )

        # Save to database
        new_obj = StorageObject(
            user_id=current_user.id,
            object_name=new_filename,
            object_key=new_object_key,
            size_bytes=new_size,
            content_type=new_content_type
        )
        db.add(new_obj)

        # Log action
        db.add(UsageLog(
            user_id=current_user.id,
            action=ActionType.UPLOAD,
            object_key=new_object_key,
            bytes_transferred=new_size
        ))
        db.commit()

        savings_bytes = original_size - new_size
        savings_percent = (savings_bytes / original_size) * 100

        log_action(db, current_user.id, "FILE_COMPRESSED", object_key,
                   f"Compressed {obj.object_name}: {original_size} → {new_size} bytes ({savings_percent:.1f}% saved)")

        return {
            "message": "File compressed successfully!",
            "original_filename": obj.object_name,
            "compressed_filename": new_filename,
            "original_size_bytes": original_size,
            "compressed_size_bytes": new_size,
            "savings_bytes": savings_bytes,
            "savings_percent": round(savings_percent, 1),
            "savings_mb": round(savings_bytes / (1024*1024), 3),
            "new_object_key": new_object_key
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")


@router.get("/bulk-compression-report")
def bulk_compression_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    files = db.query(StorageObject).filter(
        StorageObject.user_id == current_user.id
    ).all()

    recommendations = []
    total_current_size = 0
    total_potential_savings = 0

    for f in files:
        rec = get_compression_recommendation(f.object_name, f.content_type, f.size_bytes)
        total_current_size += f.size_bytes
        if rec["should_compress"]:
            savings = f.size_bytes - rec["estimated_new_size_bytes"]
            total_potential_savings += savings
            recommendations.append({
                "filename": f.object_name,
                "object_key": f.object_key,
                "current_size_mb": round(f.size_bytes / (1024*1024), 3),
                "estimated_savings_mb": round(savings / (1024*1024), 3),
                "savings_percent": rec["estimated_savings_percent"],
                "ai_verdict": rec["ai_verdict"],
                "compression_type": rec["compression_type"],
                "reason": rec["reason"]
            })

    recommendations.sort(key=lambda x: x["estimated_savings_mb"], reverse=True)
    cost_saving = (total_potential_savings / (1024**3)) * settings.PRICING_STORAGE_PER_GB

    return {
        "total_files": len(files),
        "files_to_compress": len(recommendations),
        "total_current_size_mb": round(total_current_size / (1024*1024), 3),
        "total_potential_savings_mb": round(total_potential_savings / (1024*1024), 3),
        "total_savings_percent": round((total_potential_savings / total_current_size * 100) if total_current_size > 0 else 0, 1),
        "estimated_monthly_cost_saving": round(cost_saving, 6),
        "recommendations": recommendations
    }
from pydantic import BaseModel as PydanticBaseModel


class AnalyzeRequest(PydanticBaseModel):
    filename: str
    content_type: str
    size_bytes: float


@router.post("/analyze-before-upload")
def analyze_before_upload(
    body: AnalyzeRequest,
    current_user: User = Depends(get_current_user)
):
    from app.services.compression_service import get_compression_recommendation
    rec = get_compression_recommendation(body.filename, body.content_type, body.size_bytes)
    return {
        "filename": body.filename,
        "original_size_bytes": body.size_bytes,
        "content_type": body.content_type,
        **rec
    }