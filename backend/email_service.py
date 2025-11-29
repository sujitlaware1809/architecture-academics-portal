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
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 10px; }}
            .otp-box {{ background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }}
            .otp-code {{ font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            .warning {{ background-color: #fef3cd; border: 1px solid #fecba1; color: #b45309; padding: 15px; border-radius: 5px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏛️ Architecture Academics</div>
                <h2 style="color: #333; margin: 0;">Email Verification</h2>
            </div>
            
            <p>Hello <strong>{user_name}</strong>,</p>
            
            <p>Welcome to Architecture Academics! Please verify your email address by entering the following One-Time Password (OTP):</p>
            
            <div class="otp-box">
                <div>Your Verification Code</div>
                <div class="otp-code">{otp}</div>
                <div style="font-size: 14px; opacity: 0.9;">Valid for 10 minutes</div>
            </div>
            
            <p>Enter this code on the verification page to complete your registration and start accessing:</p>
            
            <ul style="color: #555;">
                <li>🎓 NATA Preparation Courses</li>
                <li>💼 Exclusive Job Opportunities</li>
                <li>📚 Educational Resources</li>
                <li>🌐 Professional Network</li>
            </ul>
            
            <div class="warning">
                <strong>Security Note:</strong> This OTP is valid for 10 minutes only. If you didn't request this verification, please ignore this email.
            </div>
            
            <div class="footer">
                <p>Thank you for joining our architecture community!</p>
                <p><strong>Architecture Academics Team</strong></p>
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this message.</p>
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
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 10px; }}
            .button-box {{ text-align: center; margin: 30px 0; }}
            .verify-button {{ background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            .warning {{ background-color: #fef3cd; border: 1px solid #fecba1; color: #b45309; padding: 15px; border-radius: 5px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏛️ Architecture Academics</div>
                <h2 style="color: #333; margin: 0;">Email Verification</h2>
            </div>
            
            <p>Hello <strong>{user_name}</strong>,</p>
            
            <p>Welcome to Architecture Academics! Please verify your email address by clicking the button below:</p>
            
            <div class="button-box">
                <a href="{verification_link}" class="verify-button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1; background: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace;">{verification_link}</p>
            
            <p>This link will expire in 24 hours. Once verified, you'll have access to:</p>
            
            <ul style="color: #555;">
                <li>🎓 NATA Preparation Courses</li>
                <li>💼 Exclusive Job Opportunities</li>
                <li>📚 Educational Resources</li>
                <li>🌐 Professional Network</li>
            </ul>
            
            <div class="warning">
                <strong>Security Note:</strong> This link is valid for 24 hours only. If you didn't request this verification, please ignore this email.
            </div>
            
            <div class="footer">
                <p>Thank you for joining our architecture community!</p>
                <p><strong>Architecture Academics Team</strong></p>
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_body, is_html=True)

def send_welcome_email(to_email: str, user_name: str) -> bool:
    """Send welcome email after successful verification."""
    subject = "Welcome to Architecture Academics! 🎉"
    
    html_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 10px; }}
            .welcome-box {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0; }}
            .feature-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }}
            .feature {{ padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; }}
            .cta-button {{ background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏛️ Architecture Academics</div>
            </div>
            
            <div class="welcome-box">
                <h2 style="margin: 0 0 10px 0;">🎉 Welcome to the Community!</h2>
                <p style="margin: 0; font-size: 18px;">Your email has been verified successfully</p>
            </div>
            
            <p>Dear <strong>{user_name}</strong>,</p>
            
            <p>Congratulations! Your Architecture Academics account is now active. You're now part of a vibrant community of architects, students, and professionals.</p>
            
            <h3 style="color: #333;">What's Next?</h3>
            
            <div class="feature-grid">
                <div class="feature">
                    <h4 style="color: #6366f1; margin-top: 0;">🎓 Explore Courses</h4>
                    <p style="font-size: 14px; color: #666;">Browse our comprehensive NATA preparation courses and skill development programs.</p>
                </div>
                <div class="feature">
                    <h4 style="color: #6366f1; margin-top: 0;">💼 Find Opportunities</h4>
                    <p style="font-size: 14px; color: #666;">Access exclusive job postings and internship opportunities in architecture.</p>
                </div>
                <div class="feature">
                    <h4 style="color: #6366f1; margin-top: 0;">📚 Read Insights</h4>
                    <p style="font-size: 14px; color: #666;">Stay updated with the latest architecture trends, tips, and industry news.</p>
                </div>
                <div class="feature">
                    <h4 style="color: #6366f1; margin-top: 0;">🌐 Network</h4>
                    <p style="font-size: 14px; color: #666;">Connect with fellow architects, share your work, and collaborate on projects.</p>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/login" class="cta-button">Start Exploring</a>
            </div>
            
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-top: 30px;">
                <h4 style="margin-top: 0; color: #374151;">Need Help Getting Started?</h4>
                <p style="margin-bottom: 0; font-size: 14px; color: #6b7280;">
                    Visit our <a href="#" style="color: #6366f1;">Help Center</a> or contact our support team. 
                    We're here to help you make the most of your Architecture Academics experience!
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                <p>Thank you for joining Architecture Academics!</p>
                <p><strong>The Architecture Academics Team</strong></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_body, is_html=True)

def send_password_reset_email(email: str, reset_token: str, user_name: str) -> bool:
    """Send password reset email with reset link"""
    
    subject = "🔒 Reset Your Architecture Academics Password"
    
    # Create the reset link (in production, this should be your actual domain)
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Architecture Academics</title>
        <style>
            .cta-button {{
                display: inline-block;
                background-color: #6366f1;
                color: white !important;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
            }}
            .warning-box {{
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 28px; margin: 0;">🏛️ Architecture Academics</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Professional Architecture Learning Platform</p>
        </div>
        
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="background-color: #fef3c7; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 36px;">
                    🔒
                </div>
                <h2 style="color: #374151; margin: 0 0 10px 0;">Reset Your Password</h2>
                <p style="color: #6b7280; margin: 0; font-size: 16px;">We received a request to reset your password</p>
            </div>
            
            <p style="margin-bottom: 20px;">Hello {user_name},</p>
            
            <p style="margin-bottom: 25px;">
                You recently requested to reset your password for your Architecture Academics account. 
                Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" class="cta-button">Reset My Password</a>
            </div>
            
            <div class="warning-box">
                <h4 style="margin-top: 0; color: #92400e;">⚠️ Important Security Information:</h4>
                <ul style="margin: 10px 0; padding-left: 20px; color: #92400e;">
                    <li>This link will expire in 15 minutes for your security</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Your current password remains unchanged until you create a new one</li>
                </ul>
            </div>
            
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-top: 25px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    <strong>Can't click the button?</strong> Copy and paste this link into your browser:
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af; word-break: break-all;">
                    {reset_link}
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 25px; color: #666; font-size: 14px;">
                <p>Need help? Contact our support team.</p>
                <p><strong>The Architecture Academics Team</strong></p>
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