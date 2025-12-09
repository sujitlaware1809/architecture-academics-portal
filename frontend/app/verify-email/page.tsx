"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const verifyingRef = useRef(false)

  useEffect(() => {
    const token = searchParams.get("token")
    
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link. Token is missing.")
      return
    }

    // Prevent double execution in React Strict Mode
    if (verifyingRef.current) return
    verifyingRef.current = true

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email/${token}`)
      
      if (response.ok) {
        const data = await response.json()
        setStatus("success")
        setMessage(data.message || "Email verified successfully!")
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?verified=true")
        }, 3000)
      } else {
        const error = await response.json()
        setStatus("error")
        setMessage(error.detail || "Verification failed. The link may be invalid or expired.")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setStatus("error")
      setMessage("An error occurred during verification. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
          <div className="text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Successful!</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    ✓ Your account has been activated
                  </p>
                  <p className="text-sm text-green-700">
                    Please login now. Redirecting in 3 seconds...
                  </p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Go to Login
                  </Button>
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-700">
                    The verification link may have expired or is invalid.
                  </p>
                </div>
                <div className="space-y-3">
                  <Link href="/register">
                    <Button variant="outline" className="w-full">
                      Register Again
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <Link href="/contact-us" className="font-semibold text-blue-600 hover:text-blue-700">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
