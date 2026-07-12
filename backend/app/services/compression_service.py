import io
import os
import numpy as np
from PIL import Image
import PyPDF2
from app.config import settings

# Load ML models
_savings_model = None
_compress_model = None

def _load_models():
    global _savings_model, _compress_model
    try:
        import joblib
        model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'models')
        savings_path = os.path.join(model_dir, 'savings_model.pkl')
        compress_path = os.path.join(model_dir, 'compress_model.pkl')
        if os.path.exists(savings_path) and os.path.exists(compress_path):
            _savings_model = joblib.load(compress_path)
            _compress_model = joblib.load(savings_path)
            print("✅ ML compression models loaded successfully")
        else:
            print("⚠️ ML models not found, using rule-based fallback")
    except Exception as e:
        print(f"⚠️ Failed to load ML models: {e}")

_load_models()

def _get_extension_code(extension: str) -> int:
    codes = {
        'jpg': 1, 'jpeg': 1,
        'png': 2,
        'webp': 3, 'avif': 3,
        'bmp': 4,
        'pdf': 5,
        'txt': 6,
        'csv': 7,
        'mp4': 8, 'mov': 8, 'avi': 8, 'mkv': 8,
        'zip': 9, 'rar': 9, '7z': 9, 'gz': 9,
        'docx': 10, 'xlsx': 10, 'pptx': 10,
        'gif': 11,
        'tiff': 12, 'tif': 12,
        'json': 13,
        'xml': 14,
        'html': 15, 'css': 15, 'js': 15,
        'py': 16, 'java': 16,
    }
    return codes.get(extension.lower(), 0)

def _build_features(filename: str, content_type: str, size_bytes: float) -> np.ndarray:
    size_mb = size_bytes / (1024 * 1024)
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    ct = content_type or ''

    is_image = 1 if (ct.startswith('image/') or ext in ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tiff', 'tif', 'webp', 'avif']) else 0
    is_pdf = 1 if (ct == 'application/pdf' or ext == 'pdf') else 0
    is_text = 1 if (ct.startswith('text/') or ext in ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'py', 'java', 'ts', 'md']) else 0
    is_video = 1 if (ct.startswith('video/') or ext in ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv']) else 0
    is_archive = 1 if ext in ['zip', 'rar', '7z', 'gz', 'tar', 'bz2'] else 0
    is_office = 1 if ext in ['docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt'] else 0
    ext_code = _get_extension_code(ext)

    return np.array([size_mb, is_image, is_pdf, is_text, is_video, is_archive, is_office, ext_code]).reshape(1, -1)

def _rule_based_recommendation(filename: str, content_type: str, size_bytes: float) -> dict:
    size_mb = size_bytes / (1024 * 1024)
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    ct = content_type or ''

    if size_bytes < 10 * 1024:
        return {"should_compress": False, "savings": 0, "reason": "File is already very small (under 10KB). No compression needed.", "compression_type": None, "verdict": "optimal"}

    if ext in ['zip', 'rar', '7z', 'gz', 'tar', 'bz2']:
        return {"should_compress": False, "savings": 0, "reason": "File is already in a compressed archive format.", "compression_type": None, "verdict": "already_compressed"}

    if ext in ['webp', 'avif']:
        return {"should_compress": False, "savings": 0, "reason": "File is already in a modern optimized format.", "compression_type": None, "verdict": "already_optimized"}

    if ct.startswith('image/') or ext in ['jpg', 'jpeg']:
        if size_mb > 1: return {"should_compress": True, "savings": 65, "reason": f"Large JPEG of {size_mb:.1f}MB — high compression potential detected.", "compression_type": "image_jpeg", "verdict": "highly_recommended"}
        return {"should_compress": True, "savings": 40, "reason": f"JPEG image can be compressed to save storage.", "compression_type": "image_jpeg", "verdict": "recommended"}

    if ext == 'png':
        if size_mb > 0.5: return {"should_compress": True, "savings": 50, "reason": f"PNG of {size_mb:.1f}MB — significant compression achievable.", "compression_type": "image_png", "verdict": "recommended"}
        return {"should_compress": False, "savings": 10, "reason": "PNG is small. Compression not significantly beneficial.", "compression_type": None, "verdict": "optional"}

    if ext in ['bmp', 'gif', 'tiff', 'tif']:
        return {"should_compress": True, "savings": 60, "reason": f"{ext.upper()} format has very high compression potential.", "compression_type": "image_jpeg", "verdict": "highly_recommended"}

    if ct == 'application/pdf' or ext == 'pdf':
        if size_mb > 5: return {"should_compress": True, "savings": 55, "reason": f"Large PDF of {size_mb:.1f}MB — AI predicts 50-60% reduction.", "compression_type": "pdf", "verdict": "highly_recommended"}
        if size_mb > 1: return {"should_compress": True, "savings": 35, "reason": f"PDF of {size_mb:.1f}MB can be optimized.", "compression_type": "pdf", "verdict": "recommended"}
        return {"should_compress": False, "savings": 10, "reason": "PDF is small. Minimal compression benefit.", "compression_type": None, "verdict": "optional"}

    if ct.startswith('text/') or ext in ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'py']:
        if size_bytes > 100 * 1024: return {"should_compress": True, "savings": 75, "reason": "Text-based file — AI predicts 70-80% compression ratio.", "compression_type": "text", "verdict": "highly_recommended"}

    return {"should_compress": False, "savings": 0, "reason": "File type does not benefit significantly from compression.", "compression_type": None, "verdict": "not_applicable"}

def get_compression_recommendation(filename: str, content_type: str, size_bytes: float) -> dict:
    size_mb = size_bytes / (1024 * 1024)

    # Try ML model first
    ml_used = False
    ml_savings = 0
    ml_should_compress = False

    if _savings_model is not None and _compress_model is not None:
        try:
            features = _build_features(filename, content_type, size_bytes)
            ml_savings = float(np.clip(_savings_model.predict(features)[0], 0, 95))
            ml_compress_prob = float(_compress_model.predict(features)[0])
            ml_should_compress = ml_compress_prob > 0.5
            ml_used = True
        except Exception as e:
            print(f"ML prediction failed: {e}")

    # Get rule-based recommendation
    rule_rec = _rule_based_recommendation(filename, content_type, size_bytes)

    # Combine ML + rules
    if ml_used:
        final_savings = (ml_savings * 0.6 + rule_rec["savings"] * 0.4)
        final_should = ml_should_compress or rule_rec["should_compress"]
        final_savings = round(final_savings, 1)
        method = "ML Model + Rule Engine"
    else:
        final_savings = rule_rec["savings"]
        final_should = rule_rec["should_compress"]
        method = "Rule-based Engine"

    # Determine verdict
    if final_savings >= 60:
        verdict = "highly_recommended"
    elif final_savings >= 30:
        verdict = "recommended"
    elif final_savings >= 10:
        verdict = "optional"
    else:
        verdict = rule_rec.get("verdict", "not_applicable")
        final_should = False

    estimated_new_size = size_bytes * (1 - final_savings / 100)
    savings_bytes = size_bytes - estimated_new_size

    # Generate AI reason
    ext = filename.lower().split('.')[-1] if '.' in filename else 'file'
    if final_should and ml_used:
        reason = f"AI model analyzed {ext.upper()} file ({size_mb:.2f}MB) and predicts {final_savings:.0f}% compression savings using {method}. Estimated size after compression: {estimated_new_size/1024/1024:.2f}MB."
    elif final_should:
        reason = rule_rec["reason"]
    else:
        reason = rule_rec["reason"]

    return {
        "should_compress": final_should,
        "reason": reason,
        "estimated_savings_percent": final_savings if final_should else 0,
        "estimated_new_size_bytes": estimated_new_size,
        "compression_type": rule_rec.get("compression_type"),
        "quality_impact": "minimal" if final_savings < 50 else "low",
        "ai_verdict": verdict,
        "ml_model_used": ml_used,
        "prediction_method": method
    }


def compress_image(file_data: bytes, content_type: str, quality: int = 75) -> tuple:
    try:
        img = Image.open(io.BytesIO(file_data))
        if img.mode in ('RGBA', 'P', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            if img.mode == 'RGBA':
                background.paste(img, mask=img.split()[-1])
            else:
                background.paste(img)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        compressed = output.getvalue()
        return compressed, len(compressed)
    except Exception as e:
        raise Exception(f"Image compression failed: {e}")


def compress_pdf(file_data: bytes) -> tuple:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_data))
        writer = PyPDF2.PdfWriter()
        for page in reader.pages:
            page.compress_content_streams()
            writer.add_page(page)
        writer.add_metadata({})
        output = io.BytesIO()
        writer.write(output)
        compressed = output.getvalue()
        return compressed, len(compressed)
    except Exception as e:
        raise Exception(f"PDF compression failed: {e}")