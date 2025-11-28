import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

def send_email(html_content):
    sender_email = os.environ.get('EMAIL_USER')
    password = os.environ.get('GMAIL_APP_PASSWORD')
    recipients_str = os.environ.get('EMAIL_RECIPIENTS', 'dayahere@gmail.com')
    recipients = [r.strip() for r in recipients_str.split(',') if r.strip()]
    
    if not sender_email or not password:
        logging.warning("Email credentials not found. Skipping email send.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Nifty 50 Institutional Daily Analysis - {os.environ.get('DATE', 'Today')}"
    msg["From"] = sender_email
    msg["To"] = ", ".join(recipients)

    part = MIMEText(html_content, "html")
    msg.attach(part)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, recipients, msg.as_string())
        logging.info(f"Email sent successfully to {recipients}!")
    except Exception as e:
        logging.error(f"Failed to send email: {e}")
