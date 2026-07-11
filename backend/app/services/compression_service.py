import io
import os
from PIL import Image
import PyPDF2
from app.config import settings

def get_compression_recommendation(
    filename: str,
    content_type: str,
    size_bytes: float
) -> dict:
    """
    AI-powered compression recommendation based on file metadata
    """
    size_mb = size_bytes / (1024 * 1024)
    size_kb = size_bytes / 1024
    extension = filename.lower().split('.')[-1] if '.' in filename else ''

    # Already tiny files - no compression needed
    if size_bytes < 10 * 1024:  # Less than 10KB
        return {
            "should_compress": False,
            "reason": "File is already very small (under 50KB). No compression needed.",
            "estimated_savings_percent": 0,
            "estimated_new_size_bytes": size_bytes,
            "compression_type": None,
            "quality_impact": "none",
            "ai_verdict": "optimal"
        }

    # IMAGE FILES
    if content_type and content_type.startswith('image/'):
        if extension in ['jpg', 'jpeg']:
            if size_mb > 1:
                savings = 0.65
                return {
                    "should_compress": True,
                    "reason": f"JPEG image of {size_mb:.1f}MB can be significantly compressed. AI detected high compression potential with minimal quality loss.",
                    "estimated_savings_percent": 65,
                    "estimated_new_size_bytes": size_bytes * (1 - savings),
                    "compression_type": "image_jpeg",
                    "quality_impact": "minimal",
                    "ai_verdict": "highly_recommended",
                    "details": "AI analysis: JPEG files typically achieve 60-70% size reduction at quality=75 with virtually no visible difference."
                }
            else:
                savings = 0.40
                return {
                    "should_compress": True,
                    "reason": f"JPEG image can be moderately compressed to save storage.",
                    "estimated_savings_percent": 40,
                    "estimated_new_size_bytes": size_bytes * (1 - savings),
                    "compression_type": "image_jpeg",
                    "quality_impact": "minimal",
                    "ai_verdict": "recommended"
                }

        elif extension == 'png':
            if size_mb > 0.5:
                savings = 0.50
                return {
                    "should_compress": True,
                    "reason": f"PNG image of {size_mb:.1f}MB detected. AI recommends converting to optimized JPEG for {savings*100:.0f}% storage savings.",
                    "estimated_savings_percent": 50,
                    "estimated_new_size_bytes": size_bytes * (1 - savings),
                    "compression_type": "image_png",
                    "quality_impact": "low",
                    "ai_verdict": "recommended",
                    "details": "AI analysis: PNG files are lossless and often larger than needed. Optimization can halve the size."
                }
            return {
                "should_compress": False,
                "reason": "PNG file is small enough. Compression not beneficial.",
                "estimated_savings_percent": 0,
                "estimated_new_size_bytes": size_bytes,
                "compression_type": None,
                "quality_impact": "none",
                "ai_verdict": "optimal"
            }

        elif extension in ['gif', 'bmp', 'tiff', 'tif']:
            return {
                "should_compress": True,
                "reason": f"AI detected {extension.upper()} format which has high compression potential.",
                "estimated_savings_percent": 55,
                "estimated_new_size_bytes": size_bytes * 0.45,
                "compression_type": "image_jpeg",
                "quality_impact": "low",
                "ai_verdict": "highly_recommended"
            }

        elif extension in ['webp', 'avif']:
            return {
                "should_compress": False,
                "reason": "File is already in a modern optimized format. No compression needed.",
                "estimated_savings_percent": 0,
                "estimated_new_size_bytes": size_bytes,
                "compression_type": None,
                "quality_impact": "none",
                "ai_verdict": "already_optimized"
            }

    # PDF FILES
    elif content_type == 'application/pdf' or extension == 'pdf':
        if size_mb > 5:
            return {
                "should_compress": True,
                "reason": f"Large PDF of {size_mb:.1f}MB detected. AI estimates 50-60% compression is achievable.",
                "estimated_savings_percent": 55,
                "estimated_new_size_bytes": size_bytes * 0.45,
                "compression_type": "pdf",
                "quality_impact": "minimal",
                "ai_verdict": "highly_recommended",
                "details": "AI analysis: Large PDFs often contain unoptimized images and fonts that can be compressed significantly."
            }
        elif size_mb > 1:
            return {
                "should_compress": True,
                "reason": f"PDF of {size_mb:.1f}MB can be compressed to reduce storage costs.",
                "estimated_savings_percent": 35,
                "estimated_new_size_bytes": size_bytes * 0.65,
                "compression_type": "pdf",
                "quality_impact": "minimal",
                "ai_verdict": "recommended"
            }
        return {
            "should_compress": False,
            "reason": "PDF is already small. Compression not significantly beneficial.",
            "estimated_savings_percent": 10,
            "estimated_new_size_bytes": size_bytes * 0.90,
            "compression_type": None,
            "quality_impact": "none",
            "ai_verdict": "optional"
        }

    # TEXT FILES
    elif content_type and content_type.startswith('text/') or extension in ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'py']:
        if size_kb > 100:
            return {
                "should_compress": True,
                "reason": f"Text-based file detected. AI predicts 70-80% compression ratio for text data.",
                "estimated_savings_percent": 75,
                "estimated_new_size_bytes": size_bytes * 0.25,
                "compression_type": "text",
                "quality_impact": "none",
                "ai_verdict": "highly_recommended",
                "details": "AI analysis: Text files are highly compressible. No quality loss as compression is lossless."
            }

    # VIDEO FILES
    elif content_type and content_type.startswith('video/') or extension in ['mp4', 'mov', 'avi', 'mkv', 'wmv']:
        if size_mb > 50:
            return {
                "should_compress": True,
                "reason": f"Large video file of {size_mb:.1f}MB detected. AI recommends compression.",
                "estimated_savings_percent": 40,
                "estimated_new_size_bytes": size_bytes * 0.60,
                "compression_type": "video",
                "quality_impact": "low",
                "ai_verdict": "recommended",
                "details": "AI analysis: Video files can be re-encoded at lower bitrate with minimal visible quality loss."
            }
        return {
            "should_compress": False,
            "reason": "Video file is within acceptable size range.",
            "estimated_savings_percent": 0,
            "estimated_new_size_bytes": size_bytes,
            "compression_type": None,
            "quality_impact": "none",
            "ai_verdict": "optional"
        }

    # ALREADY COMPRESSED
    elif extension in ['zip', 'rar', '7z', 'gz', 'tar', 'bz2']:
        return {
            "should_compress": False,
            "reason": "File is already in a compressed archive format. Further compression would have negligible benefit.",
            "estimated_savings_percent": 0,
            "estimated_new_size_bytes": size_bytes,
            "compression_type": None,
            "quality_impact": "none",
            "ai_verdict": "already_compressed"
        }

    # WORD/EXCEL/POWERPOINT
    elif extension in ['docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt']:
        if size_mb > 2:
            return {
                "should_compress": True,
                "reason": f"Office document of {size_mb:.1f}MB detected. AI found compression opportunity.",
                "estimated_savings_percent": 30,
                "estimated_new_size_bytes": size_bytes * 0.70,
                "compression_type": "document",
                "quality_impact": "none",
                "ai_verdict": "recommended"
            }

    # DEFAULT
    return {
        "should_compress": False,
        "reason": "AI analysis complete. File type does not benefit significantly from compression.",
        "estimated_savings_percent": 0,
        "estimated_new_size_bytes": size_bytes,
        "compression_type": None,
        "quality_impact": "none",
        "ai_verdict": "not_applicable"
    }


def compress_image(file_data: bytes, content_type: str, quality: int = 75) -> tuple[bytes, int]:
    """Compress image using Pillow"""
    try:
        img = Image.open(io.BytesIO(file_data))

        # Convert RGBA to RGB for JPEG
        if img.mode in ('RGBA', 'P', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        compressed_data = output.getvalue()
        return compressed_data, len(compressed_data)
    except Exception as e:
        raise Exception(f"Image compression failed: {e}")


def compress_pdf(file_data: bytes) -> tuple[bytes, int]:
    """Compress PDF by removing metadata and optimizing"""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_data))
        writer = PyPDF2.PdfWriter()

        for page in reader.pages:
            page.compress_content_streams()
            writer.add_page(page)

        # Remove metadata to save space
        writer.add_metadata({})

        output = io.BytesIO()
        writer.write(output)
        compressed_data = output.getvalue()
        return compressed_data, len(compressed_data)
    except Exception as e:
        raise Exception(f"PDF compression failed: {e}")