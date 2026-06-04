from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, APIKey
from app.services.auth_service import get_current_user
from datetime import datetime, timezone
import secrets
import hashlib

router = APIRouter()

def generate_api_key() -> tuple[str, str, str]:
    raw_key = f"sx_{secrets.token_urlsafe(32)}"
    key_prefix = raw_key[:10]
    hashed = hashlib.sha256(raw_key.encode()).hexdigest()
    return raw_key, key_prefix, hashed

@router.post("/generate")
def generate_key(
    name: str,
    permissions: str = "read_write",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(APIKey).filter(
        APIKey.user_id == current_user.id,
        APIKey.is_active == True
    ).count()

    if existing >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 API keys allowed")

    raw_key, key_prefix, hashed_key = generate_api_key()

    api_key = APIKey(
        user_id=current_user.id,
        name=name,
        key=hashed_key,
        key_prefix=key_prefix,
        permissions=permissions
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    return {
        "id": api_key.id,
        "name": api_key.name,
        "key": raw_key,
        "key_prefix": key_prefix,
        "permissions": api_key.permissions,
        "created_at": api_key.created_at,
        "message": "Save this key — it will never be shown again!"
    }

@router.get("/list")
def list_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    keys = db.query(APIKey).filter(
        APIKey.user_id == current_user.id,
        APIKey.is_active == True
    ).all()
    return [{
        "id": k.id,
        "name": k.name,
        "key_prefix": k.key_prefix + "...",
        "permissions": k.permissions,
        "last_used": k.last_used,
        "created_at": k.created_at
    } for k in keys]

@router.delete("/revoke/{key_id}")
def revoke_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user.id
    ).first()
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    key.is_active = False
    db.commit()
    return {"message": "API key revoked successfully"}