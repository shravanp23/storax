import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from datetime import datetime


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Try Brevo API first, fallback to SMTP if needed
    """
    # Method 1: Brevo REST API
    if settings.BREVO_API_KEY and settings.BREVO_API_KEY.startswith('xkeysib-'):
        try:
            url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                "accept": "application/json",
                "api-key": settings.BREVO_API_KEY,
                "content-type": "application/json"
            }
            payload = {
                "sender": {
                    "name": "StoraX Cloud",
                    "email": settings.FROM_EMAIL
                },
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_content
            }
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            if response.status_code in [200, 201]:
                print(f"✅ Brevo API: Email sent to {to_email}")
                return True
            else:
                print(f"⚠️ Brevo API failed ({response.status_code}): {response.text}")
        except Exception as e:
            print(f"⚠️ Brevo API error: {e}")

    # Method 2: Brevo SMTP
    if settings.BREVO_SMTP_KEY and settings.BREVO_LOGIN:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"StoraX <{settings.FROM_EMAIL}>"
            msg['To'] = to_email
            msg.attach(MIMEText(html_content, 'html'))

            with smtplib.SMTP('smtp-relay.brevo.com', 587, timeout=15) as server:
                server.starttls()
                server.login(settings.BREVO_LOGIN, settings.BREVO_SMTP_KEY)
                server.sendmail(settings.FROM_EMAIL, to_email, msg.as_string())

            print(f"✅ Brevo SMTP: Email sent to {to_email}")
            return True
        except Exception as e:
            print(f"⚠️ Brevo SMTP error: {e}")

    # Method 3: Gmail SMTP fallback
    if settings.FROM_EMAIL and settings.GMAIL_APP_PASSWORD:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"StoraX <{settings.FROM_EMAIL}>"
            msg['To'] = to_email
            msg.attach(MIMEText(html_content, 'html'))

            with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=15) as server:
                server.login(settings.FROM_EMAIL, settings.GMAIL_APP_PASSWORD)
                server.sendmail(settings.FROM_EMAIL, to_email, msg.as_string())

            print(f"✅ Gmail SMTP: Email sent to {to_email}")
            return True
        except Exception as e:
            print(f"⚠️ Gmail SMTP error: {e}")

    print(f"❌ All email methods failed for {to_email}")
    return False


def _base_template(content: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#F8FAFC;color:#111827}}
.wrap{{max-width:600px;margin:0 auto;padding:32px 16px}}
.card{{background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}}
.hdr{{background:#0F172A;padding:28px 36px;text-align:center}}
.logo{{font-size:26px;font-weight:800;color:white;letter-spacing:-.5px}}
.logo b{{color:#60A5FA}}
.sub{{color:#94A3B8;font-size:12px;margin-top:4px}}
.body{{padding:36px}}
.ftr{{background:#F8FAFC;padding:20px 36px;text-align:center;border-top:1px solid #E5E7EB}}
.ftr p{{color:#9CA3AF;font-size:12px;line-height:1.6;margin:3px 0}}
.btn{{display:inline-block;padding:13px 28px;border-radius:100px;text-decoration:none;font-weight:700;font-size:14px;margin:6px 4px}}
.btn-dark{{background:#0F172A;color:white!important}}
.btn-blue{{background:#2563EB;color:white!important}}
.box{{background:#F8FAFC;border:1px solid #E5E7EB;border-radius:12px;padding:18px;margin:18px 0}}
.row{{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #F3F4F6}}
.row:last-child{{border:none}}
.lbl{{color:#6B7280;font-size:13px}}
.val{{color:#111827;font-size:13px;font-weight:600;text-align:right}}
h1{{font-size:22px;font-weight:800;color:#0F172A;margin-bottom:10px}}
h2{{font-size:17px;font-weight:700;color:#0F172A;margin-bottom:8px}}
p{{color:#374151;font-size:14px;line-height:1.7;margin-bottom:14px}}
.div{{height:1px;background:#E5E7EB;margin:22px 0}}
.badge{{display:inline-block;padding:3px 11px;border-radius:100px;font-size:11px;font-weight:700}}
.g{{background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0}}
.y{{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A}}
.b{{background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE}}
</style>
</head>
<body>
<div class="wrap">
<div class="card">
<div class="hdr">
  <div class="logo">Stora<b>X</b></div>
  <div class="sub">Cloud Storage Platform</div>
</div>
<div class="body">{content}</div>
<div class="ftr">
  <p>StoraX — Production-grade Multi-tenant Cloud Storage</p>
  <p>© 2026 StoraX · Built by Shravan Pawar</p>
  <p>You received this because you have a StoraX account.</p>
</div>
</div>
</div>
</body>
</html>"""


def send_welcome_email(to_email: str, full_name: str, bucket_name: str):
    first = full_name.split()[0]
    content = f"""
<h1>Welcome to StoraX, {first}! 🎉</h1>
<p>Your account has been created. You now have your own private cloud storage bucket.</p>
<div class="box">
  <div class="row"><span class="lbl">Name</span><span class="val">{full_name}</span></div>
  <div class="row"><span class="lbl">Email</span><span class="val">{to_email}</span></div>
  <div class="row"><span class="lbl">Bucket</span><span class="val" style="font-family:monospace;color:#2563EB;font-size:12px">{bucket_name}</span></div>
  <div class="row"><span class="lbl">Status</span><span class="badge g">Active</span></div>
</div>
<h2>What you can do:</h2>
<p>✅ Upload and manage files securely<br>
✅ Share files with expiry links<br>
✅ Track usage in real-time<br>
✅ Generate PDF invoices<br>
✅ AI-powered file compression<br>
✅ API key management</p>
<div class="div"></div>
<div style="text-align:center">
  <a href="https://storax-5vt3.vercel.app/dashboard" class="btn btn-blue">Go to Dashboard →</a>
</div>"""
    send_email(to_email, f"Welcome to StoraX, {first}! Your storage is ready ⚡", _base_template(content))


def send_login_notification_email(to_email: str, full_name: str, login_time: str, ip_address: str = "Unknown"):
    first = full_name.split()[0]
    content = f"""
<h1>New Login Detected 🔐</h1>
<p>Hi {first}, we noticed a new sign-in to your StoraX account.</p>
<div class="box">
  <div class="row"><span class="lbl">Account</span><span class="val">{to_email}</span></div>
  <div class="row"><span class="lbl">Time</span><span class="val">{login_time}</span></div>
  <div class="row"><span class="lbl">IP Address</span><span class="val">{ip_address}</span></div>
  <div class="row"><span class="lbl">Status</span><span class="badge g">Successful</span></div>
</div>
<p style="color:#DC2626;font-size:13px">⚠️ If this wasn't you, change your password immediately.</p>
<div class="div"></div>
<div style="text-align:center">
  <a href="https://storax-5vt3.vercel.app/dashboard" class="btn btn-dark">Open Dashboard →</a>
</div>"""
    send_email(to_email, "StoraX: New login to your account", _base_template(content))


def send_upload_confirmation_email(to_email: str, full_name: str, filename: str, file_size_bytes: float, bucket_name: str):
    first = full_name.split()[0]
    kb = file_size_bytes / 1024
    size_str = f"{kb:.1f} KB" if kb < 1024 else f"{kb/1024:.2f} MB"
    upload_time = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    content = f"""
<h1>File Uploaded Successfully ☁️</h1>
<p>Hi {first}, your file has been stored in your StoraX bucket.</p>
<div class="box">
  <div class="row"><span class="lbl">File Name</span><span class="val">{filename}</span></div>
  <div class="row"><span class="lbl">Size</span><span class="val">{size_str}</span></div>
  <div class="row"><span class="lbl">Bucket</span><span class="val" style="font-family:monospace;font-size:12px">{bucket_name}</span></div>
  <div class="row"><span class="lbl">Upload Time</span><span class="val">{upload_time}</span></div>
  <div class="row"><span class="lbl">Status</span><span class="badge g">Stored Securely</span></div>
</div>
<div class="div"></div>
<div style="text-align:center">
  <a href="https://storax-5vt3.vercel.app/files" class="btn btn-blue">View My Files →</a>
</div>"""
    send_email(to_email, f"StoraX: '{filename}' uploaded successfully", _base_template(content))


def send_invoice_email(to_email: str, full_name: str, invoice_id: int, total_amount: float,
                       period_start: str, period_end: str, storage_cost: float = 0,
                       request_cost: float = 0, bandwidth_cost: float = 0):
    first = full_name.split()[0]
    content = f"""
<h1>Invoice #{invoice_id} Generated 💳</h1>
<p>Hi {first}, your StoraX invoice is ready to view and download.</p>
<div class="box">
  <div class="row"><span class="lbl">Invoice ID</span><span class="val">#{invoice_id}</span></div>
  <div class="row"><span class="lbl">Period</span><span class="val">{period_start} → {period_end}</span></div>
  <div class="row"><span class="lbl">Storage</span><span class="val">${storage_cost}</span></div>
  <div class="row"><span class="lbl">Requests</span><span class="val">${request_cost}</span></div>
  <div class="row"><span class="lbl">Bandwidth</span><span class="val">${bandwidth_cost}</span></div>
  <div class="row"><span class="lbl" style="font-weight:700;color:#0F172A">Total Due</span><span class="val" style="font-size:20px;color:#2563EB;font-weight:800">${total_amount}</span></div>
  <div class="row"><span class="lbl">Status</span><span class="badge y">PENDING</span></div>
</div>
<div class="div"></div>
<div style="text-align:center">
  <a href="https://storax-5vt3.vercel.app/billing" class="btn btn-blue">View &amp; Download PDF →</a>
</div>"""
    send_email(to_email, f"StoraX Invoice #{invoice_id} — ${total_amount} due", _base_template(content))


def send_storage_warning_email(to_email: str, full_name: str, used_gb: float, limit_gb: float, percent: float):
    first = full_name.split()[0]
    used_mb = used_gb * 1024
    content = f"""
<h1>Storage Warning ⚠️</h1>
<p>Hi {first}, you have used <strong>{percent:.1f}%</strong> of your StoraX storage quota.</p>
<div class="box">
  <div class="row"><span class="lbl">Storage Used</span><span class="val" style="color:#D97706">{used_mb:.0f} MB ({percent:.1f}%)</span></div>
  <div class="row"><span class="lbl">Storage Limit</span><span class="val">{limit_gb} GB</span></div>
  <div class="row"><span class="lbl">Status</span><span class="badge y">Warning</span></div>
</div>
<p>💡 Use our AI Compression feature to reduce file sizes by up to 70% without quality loss.</p>
<div class="div"></div>
<div style="text-align:center">
  <a href="https://storax-5vt3.vercel.app/files" class="btn btn-dark">Manage Files →</a>
  <a href="https://storax-5vt3.vercel.app/compression" class="btn btn-blue">AI Compress →</a>
</div>"""
    send_email(to_email, f"StoraX: You've used {percent:.0f}% of your storage — Action needed", _base_template(content))


def send_share_notification_email(to_email: str, shared_by: str, filename: str, share_url: str, expires_at: str):
    content = f"""
<h1>File Shared With You 🔗</h1>
<p><strong>{shared_by}</strong> has shared a file with you via StoraX.</p>
<div class="box">
  <div class="row"><span class="lbl">File Name</span><span class="val">{filename}</span></div>
  <div class="row"><span class="lbl">Shared By</span><span class="val">{shared_by}</span></div>
  <div class="row"><span class="lbl">Link Expires</span><span class="val" style="color:#DC2626">{expires_at}</span></div>
</div>
<div class="div"></div>
<div style="text-align:center">
  <a href="{share_url}" class="btn btn-blue">Download File →</a>
</div>"""
    send_email(to_email, f"StoraX: {shared_by} shared '{filename}' with you", _base_template(content))


def send_bulk_email(to_emails: list, subject: str, html_content: str) -> list:
    results = []
    for email in to_emails:
        result = send_email(email, subject, html_content)
        results.append({"email": email, "sent": result})
    return results


def send_admin_broadcast_email(to_emails: list, subject: str, message: str, admin_name: str) -> list:
    content = f"""
<h1>{subject}</h1>
<div class="box" style="border-left:4px solid #2563EB">
  <p style="margin:0;white-space:pre-line;color:#111827">{message}</p>
</div>
<p style="color:#6B7280;font-size:13px;margin-top:14px">— {admin_name}, StoraX Admin Team</p>
<div class="div"></div>
<div style="text-align:center">
  <a href="https://storax-5vt3.vercel.app/dashboard" class="btn btn-dark">Go to StoraX →</a>
</div>"""
    return send_bulk_email(to_emails, subject, _base_template(content))