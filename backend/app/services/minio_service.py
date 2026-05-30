import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from app.config import settings

def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.MINIO_ENDPOINT}",
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="us-east-005"
    )

def create_user_bucket(bucket_name: str):
    s3 = get_s3_client()
    s3.create_bucket(Bucket=bucket_name)

def upload_file(bucket_name: str, object_key: str, file_data, content_type: str) -> int:
    s3 = get_s3_client()
    file_data.seek(0, 2)
    size = file_data.tell()
    file_data.seek(0)
    full_key = f"{bucket_name}/{object_key}"
    s3.upload_fileobj(
        file_data,
        settings.MINIO_BUCKET,
        full_key,
        ExtraArgs={"ContentType": content_type}
    )
    return size

def download_file(bucket_name: str, object_key: str):
    s3 = get_s3_client()
    full_key = f"{bucket_name}/{object_key}"
    response = s3.get_object(Bucket=settings.MINIO_BUCKET, Key=full_key)
    return response["Body"], response["ContentLength"], response.get("ContentType", "application/octet-stream")

def delete_file(bucket_name: str, object_key: str):
    s3 = get_s3_client()
    full_key = f"{bucket_name}/{object_key}"
    s3.delete_object(Bucket=settings.MINIO_BUCKET, Key=full_key)

def list_files(bucket_name: str):
    s3 = get_s3_client()
    try:
        response = s3.list_objects_v2(
            Bucket=settings.MINIO_BUCKET,
            Prefix=f"{bucket_name}/"
        )
        return response.get("Contents", [])
    except ClientError:
        return []

def get_presigned_url(bucket_name: str, object_key: str, expires: int = 3600) -> str:
    s3 = get_s3_client()
    full_key = f"{bucket_name}/{object_key}"
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.MINIO_BUCKET, "Key": full_key},
        ExpiresIn=expires
    )