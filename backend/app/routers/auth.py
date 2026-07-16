from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from app.database import SessionLocal, get_db
from app.models.user import User
from app.models.storage import AuditLog
from app.config import settings
import uuid
import logging
from time import perf_counter


logger = logging.getLogger("storax.auth")

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


def _log_login_timing(step: str, started_at: float, email: str = "unknown") -> None:
    elapsed_ms = (perf_counter() - started_at) * 1000
    logger.info("auth.login step=%s email=%s elapsed_ms=%.2f", step, email, elapsed_ms)


def _send_login_side_effects(user_email: str, full_name: str, login_time: str, ip_address: str, user_id: int) -> None:
    email_started_at = perf_counter()
    try:
        from app.services.email_service import send_login_notification_email
        send_login_notification_email(user_email, full_name, login_time, ip_address)
        _log_login_timing("login_email_sent", email_started_at, user_email)
    except Exception as exc:
        logger.warning("auth.login email_failed email=%s error=%s", user_email, exc)

    audit_started_at = perf_counter()
    db = SessionLocal()
    try:
        db.add(AuditLog(
            user_id=user_id,
            action="USER_LOGIN",
            resource="auth",
            details=f"User logged in: {user_email}",
        ))
        db.commit()
        _log_login_timing("login_audit_logged", audit_started_at, user_email)
    except Exception as exc:
        db.rollback()
        logger.warning("auth.login audit_failed email=%s error=%s", user_email, exc)
    finally:
        db.close()

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
def login(
    request: Request,
    background_tasks: BackgroundTasks,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    request_started_at = perf_counter()
    auth_started_at = perf_counter()
    user = db.query(User).filter(User.email == form_data.username).first()
    _log_login_timing("db_lookup_complete", auth_started_at, form_data.username)

    verify_started_at = perf_counter()
    if not user or not verify_password(form_data.password, user.hashed_password):
        _log_login_timing("password_verify_failed", verify_started_at, form_data.username)
        _log_login_timing("login_failed_total", request_started_at, form_data.username)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    _log_login_timing("password_verify_complete", verify_started_at, form_data.username)

    token_started_at = perf_counter()
    token = create_token({"sub": str(user.id), "email": user.email})
    _log_login_timing("jwt_created", token_started_at, user.email)

    response_started_at = perf_counter()
    ip = request.client.host if request.client else "Unknown"
    login_time = datetime.now().strftime("%B %d, %Y at %I:%M %p UTC")
    background_tasks.add_task(_send_login_side_effects, user.email, user.full_name, login_time, ip, user.id)
    _log_login_timing("side_effects_scheduled", response_started_at, user.email)
    _log_login_timing("login_success_total", request_started_at, user.email)

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