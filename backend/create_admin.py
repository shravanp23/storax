import sys
sys.path.append('.')

from app.database import SessionLocal, engine
from app.models.user import User
from app.models.storage import StorageObject, UsageLog
from app.models.billing import Invoice
from app.database import Base
from app.routers.auth import hash_password
import uuid

Base.metadata.create_all(bind=engine)

db = SessionLocal()

existing = db.query(User).filter(User.email == "admin@storax.com").first()
if existing:
    print("Admin already exists!")
else:
    admin = User(
        full_name="Shravan Admin",
        email="admin@storax.com",
        hashed_password=hash_password("admin123"),
        bucket_name=f"admin-{uuid.uuid4().hex[:8]}",
        is_admin=True
    )
    db.add(admin)
    db.commit()
    print("✅ Admin created successfully!")

db.close()