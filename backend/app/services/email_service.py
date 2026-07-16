import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from app.config import settings
from datetime import datetime

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    try:
        if not settings.BREVO_API_KEY:
            print(f"⚠️ Brevo API key not configured")
            return False

        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = settings.BREVO_API_KEY

        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )

        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": to_email}],
            sender={"name": "StoraX", "email": settings.FROM_EMAIL},
            subject=subject,
            html_content=html_content
        )

        api_instance.send_transac_email(send_smtp_email)
        print(f"✅ Email sent to {to_email}: {subject}")
        return True

    except ApiException as e:
        print(f"❌ Brevo API error: {e}")
        return False
    except Exception as e:
        print(f"❌ Email error: {e}")
        return False

def _base_template(content: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #F8FAFC; }}
            .wrapper {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .card {{ background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
            .header {{ background: #0F172A; padding: 32px 40px; text-align: center; }}
            .logo {{ font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.5px; }}
            .logo span {{ color: #60A5FA; }}
            .tagline {{ color: #94A3B8; font-size: 13px; margin-top: 6px; }}
            .body {{ padding: 40px; }}
            .footer {{ background: #F8FAFC; padding: 24px 40px; text-align: center; border-top: 1px solid #E5E7EB; }}
            .footer p {{ color: #9CA3AF; font-size: 12px; line-height: 1.6; }}
            .btn {{ display: inline-block; background: #0F172A; color: white !important; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 8px 4px; }}
            .btn-blue {{ background: #2563EB; }}
            .info-box {{ background: #F8FAFC; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin: 20px 0; }}
            .info-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }}
            .info-row:last-child {{ border-bottom: none; }}
            .info-label {{ color: #6B7280; font-size: 13px; }}
            .info-value {{ color: #111827; font-size: 13px; font-weight: 600; }}
            h1 {{ font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 12px; }}
            h2 {{ font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 10px; }}
            p {{ color: #374151; font-size: 15px; line-height: 1.7; margin-bottom: 16px; }}
            .badge {{ display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }}
            .badge-green {{ background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; }}
            .badge-yellow {{ background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }}
            .divider {{ height: 1px; background: #E5E7EB; margin: 24px 0; }}
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="card">
                <div class="header">
                    <div class="logo">Stora<span>X</span></div>
                    <div class="tagline">Cloud Storage Platform</div>
                </div>
                <div class="body">
                    {content}
                </div>
                <div class="footer">
                    <p>StoraX — Production-grade Multi-tenant Cloud Storage</p>
                    <p style="margin-top: 8px;">© 2026 StoraX. Built by Shravan Pawar.</p>
                    <p style="margin-top: 8px; color: #D1D5DB;">You received this because you have a StoraX account.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def send_welcome_email(to_email: str, full_name: str, bucket_name: str):
    first_name = full_name.split(' ')[0]
    content = f"""
        <h1>Welcome to StoraX, {first_name}! 🎉</h1>
        <p>Your account has been created successfully. You now have your own private cloud storage bucket ready to use.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Account Name</span>
                <span class="info-value">{full_name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{to_email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Storage Bucket</span>
                <span class="info-value" style="font-family: monospace; color: #2563EB; font-size: 12px;">{bucket_name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status</span>
                <span class="badge badge-green">Active</span>
            </div>
        </div>
        <h2>What you can do:</h2>
        <p>
            ✅ Upload and manage files securely<br>
            ✅ Share files with expiry links<br>
            ✅ Track usage in real-time<br>
            ✅ Generate PDF invoices<br>
            ✅ AI-powered file compression<br>
            ✅ Generate API keys
        </p>
        <div class="divider"></div>
        <div style="text-align: center;">
            <a href="https://storax-5vt3.vercel.app/dashboard" class="btn btn-blue">Go to Dashboard →</a>
        </div>
    """
    send_email(
        to_email,
        f"Welcome to StoraX, {first_name}! Your storage is ready ⚡",
        _base_template(content)
    )

def send_login_notification_email(to_email: str, full_name: str, login_time: str, ip_address: str = "Unknown"):
    first_name = full_name.split(' ')[0]
    content = f"""
        <h1>New Login Detected 🔐</h1>
        <p>Hi {first_name}, we noticed a new login to your StoraX account. If this was you, no action is needed.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Account</span>
                <span class="info-value">{to_email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Login Time</span>
                <span class="info-value">{login_time}</span>
            </div>
            <div class="info-row">
                <span class="info-label">IP Address</span>
                <span class="info-value">{ip_address}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status</span>
                <span class="badge badge-green">Successful</span>
            </div>
        </div>
        <p style="color: #DC2626; font-size: 14px;">⚠️ If you did not perform this login, please change your password immediately.</p>
        <div class="divider"></div>
        <div style="text-align: center;">
            <a href="https://storax-5vt3.vercel.app/dashboard" class="btn">Open Dashboard →</a>
        </div>
    """
    send_email(
        to_email,
        "StoraX: New login to your account",
        _base_template(content)
    )

def send_upload_confirmation_email(to_email: str, full_name: str, filename: str, file_size_bytes: float, bucket_name: str):
    first_name = full_name.split(' ')[0]
    size_kb = file_size_bytes / 1024
    size_str = f"{size_kb:.1f} KB" if size_kb < 1024 else f"{size_kb/1024:.2f} MB"
    upload_time = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    content = f"""
        <h1>File Uploaded Successfully ☁️</h1>
        <p>Hi {first_name}, your file has been uploaded to your StoraX storage bucket.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">File Name</span>
                <span class="info-value">{filename}</span>
            </div>
            <div class="info-row">
                <span class="info-label">File Size</span>
                <span class="info-value">{size_str}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Bucket</span>
                <span class="info-value" style="font-family: monospace; font-size: 12px;">{bucket_name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Upload Time</span>
                <span class="info-value">{upload_time}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status</span>
                <span class="badge badge-green">Stored Securely</span>
            </div>
        </div>
        <p style="font-size: 13px; color: #6B7280;">Your file is now stored securely and accessible from your dashboard.</p>
        <div class="divider"></div>
        <div style="text-align: center;">
            <a href="https://storax-5vt3.vercel.app/files" class="btn btn-blue">View My Files →</a>
        </div>
    """
    send_email(
        to_email,
        f"StoraX: '{filename}' uploaded successfully",
        _base_template(content)
    )

def send_invoice_email(to_email: str, full_name: str, invoice_id: int, total_amount: float,
                       period_start: str, period_end: str, storage_cost: float = 0,
                       request_cost: float = 0, bandwidth_cost: float = 0):
    first_name = full_name.split(' ')[0]
    content = f"""
        <h1>Invoice #{invoice_id} Generated 💳</h1>
        <p>Hi {first_name}, your StoraX invoice has been generated and is ready to download.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Invoice ID</span>
                <span class="info-value">#{invoice_id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Billing Period</span>
                <span class="info-value">{period_start} to {period_end}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Storage Cost</span>
                <span class="info-value">${storage_cost}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Request Cost</span>
                <span class="info-value">${request_cost}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Bandwidth Cost</span>
                <span class="info-value">${bandwidth_cost}</span>
            </div>
            <div class="info-row">
                <span class="info-label" style="font-weight: 700; color: #0F172A;">Total Due</span>
                <span class="info-value" style="font-size: 20px; color: #2563EB; font-weight: 800;">${total_amount}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status</span>
                <span class="badge badge-yellow">PENDING</span>
            </div>
        </div>
        <div class="divider"></div>
        <div style="text-align: center;">
            <a href="https://storax-5vt3.vercel.app/billing" class="btn btn-blue">View & Download Invoice →</a>
        </div>
    """
    send_email(
        to_email,
        f"StoraX Invoice #{invoice_id} — ${total_amount} due",
        _base_template(content)
    )

def send_storage_warning_email(to_email: str, full_name: str, used_gb: float, limit_gb: float, percent: float):
    first_name = full_name.split(' ')[0]
    used_mb = used_gb * 1024
    content = f"""
        <h1>⚠️ Storage Warning</h1>
        <p>Hi {first_name}, you have used <strong>{percent:.1f}%</strong> of your StoraX storage quota.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">Storage Used</span>
                <span class="info-value" style="color: #D97706;">{used_mb:.0f} MB ({percent:.1f}%)</span>
            </div>
            <div class="info-row">
                <span class="info-label">Storage Limit</span>
                <span class="info-value">{limit_gb} GB</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status</span>
                <span class="badge badge-yellow">⚠️ Warning</span>
            </div>
        </div>
        <p>💡 Use our AI Compression feature to reduce file sizes by up to 70%.</p>
        <div class="divider"></div>
        <div style="text-align: center;">
            <a href="https://storax-5vt3.vercel.app/files" class="btn">Manage Files →</a>
            <a href="https://storax-5vt3.vercel.app/compression" class="btn btn-blue">AI Compress →</a>
        </div>
    """
    send_email(
        to_email,
        f"StoraX: You've used {percent:.0f}% of your storage",
        _base_template(content)
    )

def send_share_notification_email(to_email: str, shared_by: str, filename: str, share_url: str, expires_at: str):
    content = f"""
        <h1>🔗 File Shared With You</h1>
        <p><strong>{shared_by}</strong> has shared a file with you via StoraX.</p>
        <div class="info-box">
            <div class="info-row">
                <span class="info-label">File Name</span>
                <span class="info-value">{filename}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Shared By</span>
                <span class="info-value">{shared_by}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Link Expires</span>
                <span class="info-value" style="color: #DC2626;">{expires_at}</span>
            </div>
        </div>
        <div class="divider"></div>
        <div style="text-align: center;">
            <a href="{share_url}" class="btn btn-blue">Download File →</a>
        </div>
    """
    send_email(
        to_email,
        f"StoraX: {shared_by} shared '{filename}' with you",
        _base_template(content)
    )

def send_bulk_email(to_emails: list, subject: str, html_content: str) -> list:
    results = []
    for email in to_emails:
        result = send_email(email, subject, html_content)
        results.append({"email": email, "sent": result})
    return results

def send_admin_broadcast_email(to_emails: list, subject: str, message: str, admin_name: str) -> list:
    content = f"""
        <h1>{subject}</h1>
        <div class="info-box" style="border-left: 4px solid #2563EB;">
            <p style="margin: 0; white-space: pre-line; color: #111827;">{message}</p>
        </div>
        <p style="color: #6B7280; font-size: 13px; margin-top: 16px;">— {admin_name}, StoraX Admin Team</p>
        <div class="divider"></div>
        <div style="text-align: center;">
            <a href="https://storax-5vt3.vercel.app/dashboard" class="btn">Go to StoraX →</a>
        </div>
    """
    return send_bulk_email(to_emails, subject, _base_template(content))