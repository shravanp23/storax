from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.models.user import User
from app.models.billing import Invoice
from app.services.auth_service import get_current_user
from app.services.billing_service import calculate_bill, generate_invoice
import io

router = APIRouter()

@router.get("/current")
def current_bill(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return calculate_bill(current_user.id, db, period_start, now)

@router.post("/generate")
def generate_bill(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    invoice = generate_invoice(current_user.id, db, period_start, now)
    return {"message": "Invoice generated", "invoice_id": invoice.id,
            "total_amount": invoice.total_amount}

@router.get("/invoices")
def list_invoices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id)\
        .order_by(Invoice.created_at.desc()).all()
    return [{"id": i.id, "period_start": i.period_start, "period_end": i.period_end,
             "storage_gb": i.storage_gb, "total_requests": i.total_requests,
             "bandwidth_gb": i.bandwidth_gb, "storage_cost": i.storage_cost,
             "request_cost": i.request_cost, "bandwidth_cost": i.bandwidth_cost,
             "total_amount": i.total_amount, "status": i.status,
             "created_at": i.created_at} for i in invoices]

@router.get("/invoice/{invoice_id}/pdf")
def download_invoice_pdf(invoice_id: int, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id,
                                       Invoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib import colors

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("StoraX — Invoice", styles["Title"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Invoice ID: #{invoice.id}", styles["Normal"]))
    elements.append(Paragraph(f"Customer: {current_user.full_name}", styles["Normal"]))
    elements.append(Paragraph(f"Email: {current_user.email}", styles["Normal"]))
    elements.append(Paragraph(f"Period: {invoice.period_start.date()} to {invoice.period_end.date()}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    data = [
        ["Description", "Usage", "Rate", "Amount"],
        ["Storage", f"{invoice.storage_gb:.4f} GB", "$0.02/GB", f"${invoice.storage_cost}"],
        ["API Requests", str(invoice.total_requests), "$0.01/1000", f"${invoice.request_cost}"],
        ["Bandwidth", f"{invoice.bandwidth_gb:.4f} GB", "$0.09/GB", f"${invoice.bandwidth_cost}"],
        ["", "", "TOTAL", f"${invoice.total_amount}"],
    ]
    table = Table(data, colWidths=[200, 100, 100, 100])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6C63FF")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F3F4F6")]),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename=storax-invoice-{invoice.id}.pdf"})