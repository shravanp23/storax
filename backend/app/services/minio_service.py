import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from app.config import settings

def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4")
    )

def create_user_bucket(bucket_name: str):
    s3 = get_s3_client()
    try:
        s3.create_bucket(Bucket=bucket_name)
    except ClientError as e:
        if e.response["Error"]["Code"] != "BucketAlreadyOwnedByYou":
            raise e

def upload_file(bucket_name: str, object_key: str, file_data, content_type: str) -> int:
    s3 = get_s3_client()
    file_data.seek(0, 2)
    size = file_data.tell()
    file_data.seek(0)
    s3.upload_fileobj(
        file_data, bucket_name, object_key,
        ExtraArgs={"ContentType": content_type}
    )
    return size

def download_file(bucket_name: str, object_key: str):
    s3 = get_s3_client()
    response = s3.get_object(Bucket=bucket_name, Key=object_key)
    return response["Body"], response["ContentLength"], response.get("ContentType", "application/octet-stream")

def delete_file(bucket_name: str, object_key: str):
    s3 = get_s3_client()
    s3.delete_object(Bucket=bucket_name, Key=object_key)

def list_files(bucket_name: str):
    s3 = get_s3_client()
    try:
        response = s3.list_objects_v2(Bucket=bucket_name)
        return response.get("Contents", [])
    except ClientError:
        return []

def get_presigned_url(bucket_name: str, object_key: str, expires: int = 3600) -> str:
    s3 = get_s3_client()
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket_name, "Key": object_key},
        ExpiresIn=expires
    )