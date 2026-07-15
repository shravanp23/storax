from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.config import settings
import uuid

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_minio_bucket(bucket_name: str):
    pass

@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    bucket_name = f"user-{uuid.uuid4().hex[:8]}"
    user = User(
        full_name=body.full_name,
        email=body.email,
        hashed_password=hash_password(body.password),
        bucket_name=bucket_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_minio_bucket(bucket_name)

    # Send welcome email automatically
    try:
        from app.services.email_service import send_welcome_email
        send_welcome_email(user.email, user.full_name, user.bucket_name)
    except Exception as e:
        print(f"Welcome email error: {e}")

    # Log registration
    try:
        from app.routers.auditlogs import log_action
        log_action(db, user.id, "USER_REGISTERED", "auth", f"New user registered: {user.email}")
    except Exception as e:
        print(f"Audit log error: {e}")

    token = create_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "bucket_name": user.bucket_name,
            "is_admin": user.is_admin
        }
    }

@router.post("/login")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"sub": str(user.id), "email": user.email})

    # Send login notification email automatically
    try:
        from app.services.email_service import send_login_notification_email
        ip = request.client.host if request.client else "Unknown"
        login_time = datetime.now().strftime("%B %d, %Y at %I:%M %p UTC")
        send_login_notification_email(user.email, user.full_name, login_time, ip)
    except Exception as e:
        print(f"Login email error: {e}")

    # Log login
    try:
        from app.routers.auditlogs import log_action
        log_action(db, user.id, "USER_LOGIN", "auth", f"User logged in: {user.email}")
    except Exception as e:
        print(f"Audit log error: {e}")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "bucket_name": user.bucket_name,
            "is_admin": user.is_admin
        }
    }

@router.get("/me")
def get_me(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "bucket_name": user.bucket_name,
        "is_admin": user.is_admin,
        "created_at": user.created_at
    }