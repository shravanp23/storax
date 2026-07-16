from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    MINIO_ENDPOINT: str = "s3.us-east-005.backblazeb2.com"
    MINIO_ACCESS_KEY: str = ""
    MINIO_SECRET_KEY: str = ""
    MINIO_SECURE: bool = True
    MINIO_BUCKET: str = "storax-files"

    FROM_EMAIL: str = "shravanpawar208@gmail.com"
    GMAIL_APP_PASSWORD: str = ""
    SENDGRID_API_KEY: str = ""
    BREVO_API_KEY: str = ""

    PRICING_STORAGE_PER_GB: float = 0.02
    PRICING_REQUESTS_PER_1000: float = 0.01
    PRICING_BANDWIDTH_PER_GB: float = 0.09

    class Config:
        env_file = ".env"

settings = Settings()