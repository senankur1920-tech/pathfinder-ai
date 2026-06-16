"""Test email with corrected address."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_EMAIL = "someoneme172@gmail.com"
SMTP_PASSWORD = "azuy vgzb livq msak"
NOTIFY_EMAIL = "senankur1920@gmail.com"

print(f"Sending test email from {SMTP_EMAIL} to {NOTIFY_EMAIL}...")
try:
    msg = MIMEMultipart()
    msg["Subject"] = "TEST - PathFinder AI Email Working!"
    msg["From"] = f"PathFinder AI <{SMTP_EMAIL}>"
    msg["To"] = NOTIFY_EMAIL
    msg.attach(MIMEText("If you see this, sales email alerts are WORKING!", "plain"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, NOTIFY_EMAIL, msg.as_string())
    print("SUCCESS! Check senankur1920@gmail.com inbox!")
except Exception as e:
    print(f"FAILED: {e}")
