import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_email(to_email: str, subject: str, html_content: str):
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"StoraX ⚡ <{settings.FROM_EMAIL}>"
        msg['To'] = to_email

        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(settings.FROM_EMAIL, settings.GMAIL_APP_PASSWORD)
            server.sendmail(settings.FROM_EMAIL, to_email, msg.as_string())

        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Email error: {e}")

def send_welcome_email(to_email: str, full_name: str, bucket_name: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F0E17; color: #E8E8F0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6C63FF; font-size: 32px;">⚡ StoraX</h1>
        </div>
        <h2 style="color: #E8E8F0;">Welcome to StoraX, {full_name}! 🎉</h2>
        <p style="color: #9999BB; line-height: 1.7;">Your account has been created successfully. You now have your own isolated cloud storage bucket.</p>
        <div style="background: #1E1E3A; border: 1px solid rgba(108,99,255,0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="color: #9999BB; margin: 0 0 8px; font-size: 12px;">YOUR STORAGE BUCKET</p>
            <p style="color: #6C63FF; font-family: monospace; font-size: 16px; font-weight: bold; margin: 0;">{bucket_name}</p>
        </div>
        <div style="background: #1E1E3A; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #E8E8F0; margin-top: 0;">What you can do:</h3>
            <ul style="color: #9999BB; line-height: 2;">
                <li>Upload and manage files securely</li>
                <li>Share files with expiry links</li>
                <li>Track your usage in real-time</li>
                <li>Generate and download PDF invoices</li>
            </ul>
        </div>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://storax-5vt3.vercel.app/dashboard" style="background: #6C63FF; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px;">Go to Dashboard →</a>
        </div>
        <p style="color: #9999BB; font-size: 12px; text-align: center; margin-top: 32px;">StoraX © 2026 — Production-grade Cloud Storage</p>
    </div>
    """
    send_email(to_email, "Welcome to StoraX! Your storage is ready ⚡", html)

def send_invoice_email(to_email: str, full_name: str, invoice_id: int, total_amount: float, period_start: str, period_end: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F0E17; color: #E8E8F0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6C63FF; font-size: 32px;">⚡ StoraX</h1>
        </div>
        <h2 style="color: #E8E8F0;">Invoice #{invoice_id} Generated 💳</h2>
        <p style="color: #9999BB;">Hi {full_name}, your invoice has been generated.</p>
        <div style="background: #1E1E3A; border: 1px solid rgba(108,99,255,0.3); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
            <p style="color: #9999BB; margin: 0 0 8px; font-size: 12px;">TOTAL AMOUNT DUE</p>
            <p style="font-size: 48px; font-weight: 900; margin: 0; color: #6C63FF;">${total_amount}</p>
            <p style="color: #9999BB; font-size: 13px; margin: 8px 0 0;">{period_start} to {period_end}</p>
        </div>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://storax-5vt3.vercel.app/billing" style="background: #6C63FF; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold;">View Invoice →</a>
        </div>
        <p style="color: #9999BB; font-size: 12px; text-align: center; margin-top: 32px;">StoraX © 2026</p>
    </div>
    """
    send_email(to_email, f"StoraX Invoice #{invoice_id} — ${total_amount} due", html)

def send_storage_warning_email(to_email: str, full_name: str, used_gb: float, limit_gb: float, percent: float):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F0E17; color: #E8E8F0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6C63FF; font-size: 32px;">⚡ StoraX</h1>
        </div>
        <h2 style="color: #F59E0B;">⚠️ Storage Warning</h2>
        <p style="color: #9999BB;">Hi {full_name}, you have used <strong style="color: #F59E0B;">{percent:.1f}%</strong> of your storage quota.</p>
        <div style="background: #1E1E3A; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <p style="color: #9999BB;">Used: <strong style="color: #F59E0B;">{used_gb:.2f} GB</strong> of {limit_gb} GB</p>
            <div style="background: #0F0E17; border-radius: 8px; height: 12px; margin-top: 12px;">
                <div style="background: #F59E0B; width: {min(percent, 100)}%; height: 12px; border-radius: 8px;"></div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://storax-5vt3.vercel.app/files" style="background: #F59E0B; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold;">Manage Files →</a>
        </div>
        <p style="color: #9999BB; font-size: 12px; text-align: center; margin-top: 32px;">StoraX © 2026</p>
    </div>
    """
    send_email(to_email, "⚠️ StoraX Storage Warning — Running low!", html)

def send_share_notification_email(to_email: str, shared_by: str, filename: str, share_url: str, expires_at: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F0E17; color: #E8E8F0; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6C63FF; font-size: 32px;">⚡ StoraX</h1>
        </div>
        <h2 style="color: #E8E8F0;">🔗 File Shared With You</h2>
        <p style="color: #9999BB;"><strong style="color: #E8E8F0;">{shared_by}</strong> shared a file with you.</p>
        <div style="background: #1E1E3A; border: 1px solid rgba(108,99,255,0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="color: #9999BB; margin: 0 0 8px; font-size: 12px;">FILE NAME</p>
            <p style="color: #E8E8F0; font-weight: bold; margin: 0 0 16px;">{filename}</p>
            <p style="color: #9999BB; margin: 0 0 8px; font-size: 12px;">EXPIRES AT</p>
            <p style="color: #FF6584; margin: 0;">{expires_at}</p>
        </div>
        <div style="text-align: center; margin-top: 32px;">
            <a href="{share_url}" style="background: #6C63FF; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold;">Download File →</a>
        </div>
        <p style="color: #9999BB; font-size: 12px; text-align: center; margin-top: 32px;">StoraX © 2026</p>
    </div>
    """
    send_email(to_email, f"🔗 {shared_by} shared a file with you on StoraX", html)