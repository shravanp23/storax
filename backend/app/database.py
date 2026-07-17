from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_timeout": 30,
}

database_url = settings.DATABASE_URL.lower()
if database_url.startswith("postgresql") or database_url.startswith("postgres"):
    engine_kwargs["connect_args"] = {"connect_timeout": 10}

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()