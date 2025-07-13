import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { DatabaseService } from "@/lib/database"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await request.json()

    // Validate input
    if (!paymentId || !razorpayPaymentId || !razorpayOrderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    // Handle demo mode
    if (!isSupabaseConfigured() || token === "demo-token" || !supabase) {
      console.log("Demo mode: Mock payment verification")

      return NextResponse.json({
        success: true,
        payment: {
          id: paymentId,
          status: "completed",
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          amount: 700, // Mock amount
          currency: "INR",
          created_at: new Date().toISOString(),
        },
      })
    }

    // Verify user with Supabase
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token)

      if (authError || !user) {
        console.error("Auth error:", authError)
        return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
      }

      // In a real implementation, verify the Razorpay signature here
      if (process.env.RAZORPAY_KEY_SECRET && razorpaySignature) {
        try {
          const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpayOrderId + "|" + razorpayPaymentId)
            .digest("hex")

          if (expectedSignature !== razorpaySignature) {
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
          }
        } catch (cryptoError) {
          console.error("Crypto verification error:", cryptoError)
          // Continue without signature verification in demo mode
        }
      }

      // Create payment record
      const paymentData = {
        id: paymentId,
        user_id: user.id,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        status: "completed",
        amount: 700, // You should get this from the order
        currency: "INR",
      }

      const { data: payment, error: createError } = await DatabaseService.createPayment(paymentData)

      if (createError) {
        console.error("Error creating payment record:", createError)
        // Don't fail the verification if we can't save to DB
      }

      // Update user to premium if this was for premium analysis
      try {
        await DatabaseService.updateUser(user.id, {
          is_premium: true,
          subscription_status: "premium",
        })
      } catch (error) {
        console.error("Error updating user to premium:", error)
      }

      return NextResponse.json({
        success: true,
        payment: payment || paymentData,
      })
    } catch (authError) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  } catch (error) {
    console.error("Verify payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
