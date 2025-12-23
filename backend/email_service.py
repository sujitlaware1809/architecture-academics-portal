"""Email service for sending OTPs and notifications."""

import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Email configuration - loaded from environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)
FROM_NAME = os.getenv("FROM_NAME", "Architecture Academics")

def generate_otp(length: int = 6) -> str:
    """Generate a random OTP of specified length."""
    return ''.join(random.choices(string.digits, k=length))

def send_email(to_email: str, subject: str, body: str, is_html: bool = True) -> bool:
    """Send email using SMTP."""
    try:
        # Check if email credentials are configured
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print("⚠️ Email credentials not configured. Using console output for development.")
            return True  # Return True to not break the flow
        
        print(f"📧 Sending email to {to_email} via {SMTP_USERNAME}")
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body
        if is_html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(FROM_EMAIL, to_email, text)
        server.quit()
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {str(e)}")
        print("📧 Falling back to console output for development")
        # Also output to console for debugging
        print(f"\n{'='*50}")
        print(f"📧 EMAIL DEBUG OUTPUT")
        print(f"{'='*50}")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"From: {FROM_NAME} <{FROM_EMAIL}>")
        print(f"{'='*50}\n")
        return True  # Return True to not break the registration flow

def send_otp_email(to_email: str, otp: str, user_name: str = "User") -> bool:
    """Send OTP verification email."""
    subject = "Verify Your Email - Architecture Academics"
    
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }}
            .container {{ max-width: 600px; margin: 40px auto; background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }}
            .header {{ text-align: center; margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }}
            .logo-img {{ height: 60px; width: auto; margin-bottom: 15px; }}
            .site-title {{ font-size: 24px; font-weight: 700; color: #111827; margin: 0; }}
            .content {{ color: #374151; line-height: 1.6; font-size: 16px; }}
            .otp-box {{ background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }}
            .otp-label {{ font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }}
            .otp-code {{ font-size: 36px; font-weight: 800; color: #2563eb; letter-spacing: 6px; margin: 0; font-family: monospace; }}
            .validity {{ font-size: 13px; color: #6b7280; margin-top: 10px; }}
            .features-list {{ list-style: none; padding: 0; margin: 20px 0; }}
            .features-list li {{ padding: 8px 0; color: #4b5563; border-bottom: 1px solid #f3f4f6; }}
            .features-list li:last-child {{ border-bottom: none; }}
            .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 13px; }}
            .warning {{ background-color: #fffbeb; border: 1px solid #fcd34d; color: #92400e; padding: 12px; border-radius: 6px; font-size: 14px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://architecture-academics.online/logo.jpg" alt="Architecture Academics" class="logo-img">
                <h1 class="site-title">Architecture Academics</h1>
            </div>
            
            <div class="content">
                <p>Hello <strong>{user_name}</strong>,</p>
                
                <p>Thank you for registering with Architecture Academics. To complete your account setup, please verify your email address using the One-Time Password (OTP) below:</p>
                
                <div class="otp-box">
                    <div class="otp-label">Verification Code</div>
                    <div class="otp-code">{otp}</div>
                    <div class="validity">Valid for 10 minutes</div>
                </div>
                
                <p>Enter this code on the verification page to access:</p>
                
                <ul class="features-list">
                    <li>NATA Preparation Courses</li>
                    <li>Exclusive Job Opportunities</li>
                    <li>Educational Resources</li>
                    <li>Professional Network</li>
                </ul>
                
                <div class="warning">
                    <strong>Security Note:</strong> If you did not request this verification, please ignore this email.
                </div>
            </div>
            
            <div class="footer">
                <p>&copy; {datetime.now().year} Architecture Academics. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_body, is_html=True)

def send_verification_email(to_email: str, token: str, user_name: str = "User") -> bool:
    """Send email verification link."""
    # In production, this should be your actual frontend URL
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    verification_link = f"{frontend_url}/verify-email?token={token}"
    
    subject = "Verify Your Email - Architecture Academics"
    
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }}
            .container {{ max-width: 600px; margin: 40px auto; background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }}
            .header {{ text-align: center; margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }}
            .logo-img {{ height: 60px; width: auto; margin-bottom: 15px; }}
            .site-title {{ font-size: 24px; font-weight: 700; color: #111827; margin: 0; }}
            .content {{ color: #374151; line-height: 1.6; font-size: 16px; }}
            .button-box {{ text-align: center; margin: 30px 0; }}
            .verify-button {{ background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block; transition: background-color 0.2s; }}
            .verify-button:hover {{ background-color: #1d4ed8; }}
            .link-box {{ background-color: #f3f4f6; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #4b5563; word-break: break-all; margin-top: 20px; }}
            .features-list {{ list-style: none; padding: 0; margin: 20px 0; }}
            .features-list li {{ padding: 8px 0; color: #4b5563; border-bottom: 1px solid #f3f4f6; }}
            .features-list li:last-child {{ border-bottom: none; }}
            .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 13px; }}
            .warning {{ background-color: #fffbeb; border: 1px solid #fcd34d; color: #92400e; padding: 12px; border-radius: 6px; font-size: 14px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://architecture-academics.online/logo.jpg" alt="Architecture Academics" class="logo-img">
                <h1 class="site-title">Architecture Academics</h1>
            </div>
            
            <div class="content">
                <p>Hello <strong>{user_name}</strong>,</p>
                
                <p>Thank you for registering with Architecture Academics. Please verify your email address by clicking the button below:</p>
                
                <div class="button-box">
                    <a href="{verification_link}" class="verify-button">Verify Email Address</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <div class="link-box">{verification_link}</div>
                
                <p>This link will expire in 24 hours. Once verified, you'll have access to:</p>
                
                <ul class="features-list">
                    <li>NATA Preparation Courses</li>
                    <li>Exclusive Job Opportunities</li>
                    <li>Educational Resources</li>
                    <li>Professional Network</li>
                </ul>
                
                <div class="warning">
                    <strong>Security Note:</strong> This link is valid for 24 hours only. If you didn't request this verification, please ignore this email.
                </div>
            </div>
            
            <div class="footer">
                <p>&copy; {datetime.now().year} Architecture Academics. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_body, is_html=True)

def send_welcome_email(to_email: str, user_name: str) -> bool:
    """Send welcome email after successful verification."""
    subject = "Welcome to Architecture Academics"
    
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }}
            .container {{ max-width: 600px; margin: 40px auto; background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }}
            .header {{ text-align: center; margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }}
            .logo-img {{ height: 60px; width: auto; margin-bottom: 15px; }}
            .site-title {{ font-size: 24px; font-weight: 700; color: #111827; margin: 0; }}
            .content {{ color: #374151; line-height: 1.6; font-size: 16px; }}
            .welcome-box {{ background-color: #ecfdf5; border: 1px solid #d1fae5; color: #065f46; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }}
            .welcome-title {{ font-size: 20px; font-weight: 600; margin: 0 0 5px 0; color: #059669; }}
            .feature-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }}
            .feature {{ padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; background-color: #fff; transition: box-shadow 0.2s; }}
            .feature:hover {{ box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
            .feature h4 {{ color: #2563eb; margin: 0 0 10px 0; font-size: 16px; }}
            .feature p {{ font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5; }}
            .cta-button {{ background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block; margin: 20px 0; transition: background-color 0.2s; }}
            .cta-button:hover {{ background-color: #1d4ed8; }}
            .help-box {{ background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 30px; }}
            .help-box h4 {{ margin: 0 0 10px 0; color: #374151; font-size: 16px; }}
            .help-box p {{ margin: 0; font-size: 14px; color: #6b7280; }}
            .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 13px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://architecture-academics.online/logo.jpg" alt="Architecture Academics" class="logo-img">
                <h1 class="site-title">Architecture Academics</h1>
            </div>
            
            <div class="content">
                <div class="welcome-box">
                    <h2 class="welcome-title">Welcome to the Community!</h2>
                    <p style="margin: 0;">Your email has been verified successfully</p>
                </div>
                
                <p>Dear <strong>{user_name}</strong>,</p>
                
                <p>Congratulations! Your Architecture Academics account is now active. You're now part of a vibrant community of architects, students, and professionals.</p>
                
                <h3 style="color: #111827; margin-top: 30px;">What's Next?</h3>
                
                <div class="feature-grid">
                    <div class="feature">
                        <h4>Explore Courses</h4>
                        <p>Browse our comprehensive NATA preparation courses and skill development programs.</p>
                    </div>
                    <div class="feature">
                        <h4>Find Opportunities</h4>
                        <p>Access exclusive job postings and internship opportunities in architecture.</p>
                    </div>
                    <div class="feature">
                        <h4>Read Insights</h4>
                        <p>Stay updated with the latest architecture trends, tips, and industry news.</p>
                    </div>
                    <div class="feature">
                        <h4>Network</h4>
                        <p>Connect with fellow architects, share your work, and collaborate on projects.</p>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="http://localhost:3000/login" class="cta-button">Start Exploring</a>
                </div>
                
                <div class="help-box">
                    <h4>Need Help Getting Started?</h4>
                    <p>
                        Visit our <a href="#" style="color: #2563eb; text-decoration: none;">Help Center</a> or contact our support team. 
                        We're here to help you make the most of your Architecture Academics experience!
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p>&copy; {datetime.now().year} Architecture Academics. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_body, is_html=True)

def send_password_reset_email(email: str, reset_token: str, user_name: str) -> bool:
    """Send password reset email with reset link"""
    
    subject = "Reset Your Architecture Academics Password"
    
    # Create the reset link dynamically using FRONTEND_BASE_URL
    frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    reset_link = f"{frontend_base_url}/reset-password?token={reset_token}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Architecture Academics</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }}
            .container {{ max-width: 600px; margin: 40px auto; background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }}
            .header {{ text-align: center; margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }}
            .logo-img {{ height: 60px; width: auto; margin-bottom: 15px; }}
            .site-title {{ font-size: 24px; font-weight: 700; color: #111827; margin: 0; }}
            .content {{ color: #374151; line-height: 1.6; font-size: 16px; }}
            .cta-button {{
                display: inline-block;
                background-color: #2563eb;
                color: white !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                transition: background-color 0.2s;
            }}
            .cta-button:hover {{ background-color: #1d4ed8; }}
            .warning-box {{
                background-color: #fffbeb;
                border: 1px solid #fcd34d;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
            }}
            .warning-box h4 {{ margin-top: 0; color: #92400e; font-size: 15px; }}
            .warning-box ul {{ margin: 10px 0; padding-left: 20px; color: #92400e; font-size: 14px; }}
            .link-box {{ background-color: #f3f4f6; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #4b5563; word-break: break-all; margin-top: 20px; }}
            .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 13px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://architecture-academics.online/logo.jpg" alt="Architecture Academics" class="logo-img">
                <h1 class="site-title">Architecture Academics</h1>
            </div>
            
            <div class="content">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #111827; margin: 0 0 10px 0;">Reset Your Password</h2>
                    <p style="color: #6b7280; margin: 0; font-size: 16px;">We received a request to reset your password</p>
                </div>
                
                <p>Hello <strong>{user_name}</strong>,</p>
                
                <p>
                    You recently requested to reset your password for your Architecture Academics account. 
                    Click the button below to create a new password:
                </p>
                
                <div style="text-align: center;">
                    <a href="{reset_link}" class="cta-button">Reset My Password</a>
                </div>
                
                <div class="warning-box">
                    <h4>Important Security Information:</h4>
                    <ul>
                        <li>This link will expire in 15 minutes for your security</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your current password remains unchanged until you create a new one</li>
                    </ul>
                </div>
                
                <p style="margin-bottom: 5px; font-size: 14px; color: #6b7280;">
                    <strong>Can't click the button?</strong> Copy and paste this link into your browser:
                </p>
                <div class="link-box">{reset_link}</div>
            </div>
            
            <div class="footer">
                <p>&copy; {datetime.now().year} Architecture Academics. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_body, is_html=True)

# For testing/development - you can use console output instead of actual email
def send_otp_console(to_email: str, otp: str, user_name: str = "User") -> bool:
    """Send OTP via console (for development)."""
    print(f"\n{'='*50}")
    print(f"📧 EMAIL VERIFICATION OTP")
    print(f"{'='*50}")
    print(f"To: {to_email}")
    print(f"Name: {user_name}")
    print(f"OTP: {otp}")
    print(f"Valid for: 10 minutes")
    print(f"{'='*50}\n")
    return True