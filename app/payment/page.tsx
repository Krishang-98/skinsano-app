"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { CreditCard, Shield, CheckCircle, AlertCircle, ArrowLeft, Loader2, Info } from "lucide-react"
import Link from "next/link"

export default function PaymentPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  // Get payment details from URL params
  const amount = searchParams.get("amount") || "700" // Default $7 = ₹700
  const type = searchParams.get("type") || "premium"
  const analysisId = searchParams.get("analysisId")
  const consultationId = searchParams.get("consultationId")

  // Convert amount to number and handle currency
  const amountInRupees = Number.parseInt(amount)
  const amountInDollars = Math.round(amountInRupees / 100) // Rough conversion for display

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true

    script.onload = () => {
      console.log("Razorpay script loaded successfully")
      setRazorpayLoaded(true)
    }

    script.onerror = () => {
      console.error("Failed to load Razorpay script")
      setError("Payment gateway failed to load. Please try again later.")
    }

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handlePayment = async () => {
    if (!user) {
      router.push("/auth/sign-in")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setDebugInfo(null)

      console.log("Creating payment order for amount:", amountInRupees)

      if (!window.Razorpay) {
        throw new Error("Payment gateway not loaded. Please refresh the page and try again.")
      }

      // Create payment order
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountInRupees,
          currency: "INR",
          analysisId,
          consultationId,
        }),
      })

      const data = await response.json()

      // Save debug info
      setDebugInfo({
        orderResponse: data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        host: window.location.host,
      })

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment order")
      }

      console.log("Payment order created:", data)

      // Check if we're in demo mode
      if (data.demo) {
        console.log("Demo mode detected, simulating payment")
        setTimeout(() => {
          router.push("/payment/success?type=" + type)
        }, 2000)
        return
      }

      // Initialize Razorpay
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "SkinSano",
        description: type === "premium" ? "Premium Analysis Upgrade" : "Consultation Payment",
        order_id: data.orderId,
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#10B981",
        },
        handler: async (response: any) => {
          console.log("Payment successful:", response)

          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                paymentId: data.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              // Redirect to success page
              router.push("/payment/success?type=" + type)
            } else {
              setError("Payment verification failed: " + (verifyData.error || "Unknown error"))
            }
          } catch (error: any) {
            console.error("Payment verification error:", error)
            setError("Payment verification failed: " + error.message)
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            console.log("Payment modal closed")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on("payment.failed", (response: any) => {
        setError(`Payment failed: ${response.error.code} - ${response.error.description}`)
        setLoading(false)
      })
      razorpay.open()
    } catch (error: any) {
      console.error("Payment error:", error)
      setError(error.message || "Payment failed. Please try again.")
      setLoading(false)
    }
  }

  const getPaymentDetails = () => {
    switch (type) {
      case "premium":
        return {
          title: "Premium Analysis Upgrade",
          description: "Unlock detailed AI analysis with personalized treatment plans",
          features: [
            "Advanced AI skin analysis",
            "Detailed treatment recommendations",
            "Progress tracking",
            "Priority support",
            "PDF reports",
          ],
        }
      case "consultation":
        return {
          title: "Dermatologist Consultation",
          description: "30-minute video consultation with a certified dermatologist",
          features: [
            "30-minute video call",
            "Professional diagnosis",
            "Treatment recommendations",
            "Follow-up support",
            "Medical certificate if needed",
          ],
        }
      default:
        return {
          title: "Payment",
          description: "Complete your payment to continue",
          features: ["Secure payment processing", "Instant confirmation", "24/7 support"],
        }
    }
  }

  const paymentDetails = getPaymentDetails()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/pricing" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Payment</h1>
          <p className="text-gray-300">Secure payment powered by Razorpay</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Payment Error</p>
                <p className="text-sm text-red-300/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Card */}
        <Card className="bg-white/10 border-gray-600 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-xl">{paymentDetails.title}</CardTitle>
                <CardDescription className="text-gray-300">{paymentDetails.description}</CardDescription>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">${amountInDollars}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features */}
            <div>
              <h3 className="text-white font-medium mb-3">What's included:</h3>
              <ul className="space-y-2">
                {paymentDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Details */}
            <div className="border-t border-gray-600 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Subtotal</span>
                <span className="text-white">₹{amountInRupees}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Processing Fee</span>
                <span className="text-white">₹0</span>
              </div>
              <div className="border-t border-gray-600 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white font-bold text-xl">₹{amountInRupees}</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={loading || !razorpayLoaded}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 text-lg font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : !razorpayLoaded ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ₹{amountInRupees}
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="flex items-center justify-center text-sm text-gray-400">
              <Shield className="w-4 h-4 mr-2" />
              Secured by Razorpay • 256-bit SSL encryption
            </div>
          </CardContent>
        </Card>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV !== "production" && debugInfo && (
          <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center mb-2">
              <Info className="h-4 w-4 text-blue-400 mr-2" />
              <h3 className="text-blue-400 font-medium">Debug Information</h3>
            </div>
            <pre className="text-xs text-gray-400 overflow-auto max-h-40 p-2 bg-black/30 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
