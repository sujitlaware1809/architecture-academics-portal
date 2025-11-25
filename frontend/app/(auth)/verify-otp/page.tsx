"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function VerifyOTPPage() {
  const [otp, setOTP] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get("email");
    const storedEmail = localStorage.getItem("pendingVerificationEmail");
    const fromLogin = searchParams.get("from") === "login" || localStorage.getItem("fromLogin");
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem("pendingVerificationEmail", emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // Only redirect to register if we're sure there's no pending verification
      console.log("No email found for verification, redirecting to register");
      router.replace("/register");
      return;
    }

    // If coming from login attempt, automatically resend OTP
    if (fromLogin && (emailParam || storedEmail)) {
      console.log("Coming from login attempt, auto-resending OTP...");
      localStorage.removeItem("fromLogin"); // Clear the flag
      setTimeout(() => {
        handleAutoResendOTP(emailParam || storedEmail);
      }, 1000);
    }

    // Start countdown timer for resend
    setTimeLeft(60); // 60 seconds initial cooldown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, router]);

  const handleAutoResendOTP = async (emailAddress: string) => {
    try {
      console.log("Auto-resending OTP for:", emailAddress);
      const result = await api.resendOTP(emailAddress);

      if (result.error) {
        console.log("Auto-resend failed:", result.error);
        setError("Failed to send OTP. Please click 'Resend OTP' to try again.");
      } else {
        console.log("Auto-resend successful");
        setMessage("🔄 New OTP sent to your email! Please check your inbox.");
        setTimeLeft(60); // Reset cooldown
      }
    } catch (error: any) {
      console.error("Auto-resend error:", error);
      setError("Failed to send OTP. Please click 'Resend OTP' to try again.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setIsLoading(false);
      return;
    }

    console.log("Verifying OTP:", { email, otp });

    try {
      const result = await api.verifyOTP({
        email: email,
        otp: otp,
      });

      console.log("OTP verification result:", result);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        // Store the token and user data
        if (typeof window !== 'undefined') {
          localStorage.setItem("access_token", result.data.access_token);
          localStorage.setItem("user", JSON.stringify(result.data.user));
          localStorage.removeItem("pendingVerificationEmail");
        }

        setMessage("Email verified successfully! Redirecting...");
        
        // Trigger auth change event
        window.dispatchEvent(new Event('auth-change'));
        
        // Redirect to dashboard after verification
        setTimeout(() => {
          router.replace("/dashboard");
        }, 2000);
      }

    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(error.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");
    setMessage("");

    try {
      const result = await api.resendOTP(email);

      if (result.error) {
        setError(result.error);
      } else {
        setMessage("OTP resent successfully! Please check your email.");
        setTimeLeft(60); // Reset cooldown
        
        // Start new countdown
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

    } catch (error: any) {
      setError(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setOTP(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a 6-digit OTP to <br />
            <span className="font-medium text-gray-900">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Message */}
          {message && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                Enter 6-digit OTP
              </Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={handleOTPChange}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono h-14"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">Didn't receive the code?</p>
            
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in {timeLeft} seconds
              </p>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </Button>
            )}
          </div>

          {/* Back to Registration */}
          <div className="pt-4 text-center">
            <Link 
              href="/register"
              className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
            >
              ← Back to Registration
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}