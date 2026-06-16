"""
Email notification service using Gmail SMTP.
Sends sales alerts to the configured private email when a female student registers/logs in.
Uses Python's built-in smtplib — no third-party packages needed.
"""

import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from app.config import settings


def send_lead_email(name: str, email: str, phone: str, state: str, stream: str):
    """
    Sends a styled HTML email notification to the admin/sales team.
    Runs in a background thread so it doesn't block the API response.
    """
    smtp_email = settings.SMTP_EMAIL
    smtp_password = settings.SMTP_APP_PASSWORD
    notify_email = settings.NOTIFY_EMAIL

    if not smtp_email or not smtp_password or not notify_email:
        print("[EMAIL] SMTP credentials not configured. Skipping email notification.")
        return

    def _send():
        try:
            timestamp = datetime.now().strftime("%d %b %Y, %I:%M %p")

            # Build HTML email body
            html_body = f"""
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899); padding: 28px 32px;">
                    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">
                        🚨 New Female Student Lead
                    </h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">
                        PathFinder AI — Sales Team Alert
                    </p>
                </div>

                <!-- Body -->
                <div style="padding: 28px 32px;">
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 20px;">
                        A female student just registered/logged in. Please contact her at the earliest.
                    </p>

                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; width: 120px;">Name</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #f1f5f9; font-size: 15px; font-weight: 600;">{name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #818cf8; font-size: 15px;">
                                <a href="mailto:{email}" style="color: #818cf8; text-decoration: none;">{email}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Phone</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #34d399; font-size: 15px; font-weight: 600;">
                                <a href="tel:{phone}" style="color: #34d399; text-decoration: none;">{phone}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">State</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #f1f5f9; font-size: 14px;">{state}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Stream</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid #1e293b; color: #f1f5f9; font-size: 14px;">{stream.upper()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Time</td>
                            <td style="padding: 12px 16px; color: #fbbf24; font-size: 14px;">{timestamp}</td>
                        </tr>
                    </table>
                </div>

                <!-- Footer -->
                <div style="padding: 16px 32px; background: #1e293b; border-top: 1px solid #334155;">
                    <p style="color: #64748b; font-size: 11px; margin: 0; text-align: center;">
                        This is an automated alert from PathFinder AI. Do not reply to this email.
                    </p>
                </div>
            </div>
            """

            # Compose email
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"🚨 New Female Student Lead — {name} ({phone})"
            msg["From"] = f"PathFinder AI <{smtp_email}>"
            msg["To"] = notify_email

            # Plain text fallback
            plain_text = (
                f"🚨 SALES ALERT — New Female Student Lead\n\n"
                f"Name  : {name}\n"
                f"Email : {email}\n"
                f"Phone : {phone}\n"
                f"State : {state}\n"
                f"Stream: {stream}\n"
                f"Time  : {timestamp}\n\n"
                f"— PathFinder AI"
            )

            msg.attach(MIMEText(plain_text, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            # Send via Gmail SMTP
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(smtp_email, smtp_password)
                server.sendmail(smtp_email, notify_email, msg.as_string())

            print(f"[EMAIL SENT] Lead notification sent to {notify_email} for student: {name}")

        except Exception as e:
            print(f"[EMAIL ERROR] Failed to send notification: {e}")

    # Run in background thread to not block API response
    thread = threading.Thread(target=_send, daemon=True)
    thread.start()
