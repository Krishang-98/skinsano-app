import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

// Mock Razorpay for demo mode
const mockRazorpay = {
  orders: {
    create: async (options: any) => {
      return {
        id: `order_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created",
        created_at: Math.floor(Date.now() / 1000),
      }
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = "INR", analysisId, consultationId } = body

    console.log("Payment order request:", { amount, currency, analysisId, consultationId })

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Get authentication token
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    // Handle demo mode or missing Supabase
    if (!isSupabaseConfigured() || !supabase) {
      console.log("Using demo mode - Supabase not configured")

      const mockOrder = await mockRazorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          analysisId: analysisId || "",
          consultationId: consultationId || "",
          timestamp: new Date().toISOString(),
          mode: "demo",
        },
      })

      return NextResponse.json({
        success: true,
        orderId: mockOrder.id,
        amount: mockOrder.amount,
        currency: mockOrder.currency,
        key: "demo_key_12345",
        demo: true,
        message: "Demo mode - No real payment will be processed",
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

      // Check if Razorpay keys are configured
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

      // If Razorpay is not configured, use demo mode
      if (!razorpayKeyId || !razorpayKeySecret || razorpayKeyId === "your_razorpay_key_id_here") {
        console.log("Using demo mode - Razorpay not configured")

        const mockOrder = await mockRazorpay.orders.create({
          amount: Math.round(amount * 100),
          currency: currency,
          receipt: `receipt_${Date.now()}`,
          notes: {
            analysisId: analysisId || "",
            consultationId: consultationId || "",
            timestamp: new Date().toISOString(),
            mode: "demo",
          },
        })

        return NextResponse.json({
          success: true,
          orderId: mockOrder.id,
          amount: mockOrder.amount,
          currency: mockOrder.currency,
          key: "demo_key_12345",
          demo: true,
          message: "Demo mode - No real payment will be processed",
        })
      }

      // Real Razorpay integration using dynamic import
      try {
        // Dynamically import Razorpay only when needed
        const { default: Razorpay } = await import("razorpay")

        const razorpay = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        })

        const options = {
          amount: Math.round(amount * 100), // Convert to paise
          currency: currency,
          receipt: `receipt_${Date.now()}`,
          notes: {
            userId: user.id,
            analysisId: analysisId || "",
            consultationId: consultationId || "",
            timestamp: new Date().toISOString(),
          },
        }

        console.log("Creating Razorpay order with options:", options)

        const order = await razorpay.orders.create(options)

        console.log("Razorpay order created successfully:", order.id)

        // Save order to database (optional, don't fail if this fails)
        try {
          const { error: dbError } = await supabase.from("payment_orders").insert({
            order_id: order.id,
            user_id: user.id,
            amount: amount,
            currency: currency,
            analysis_id: analysisId || null,
            consultation_id: consultationId || null,
            status: "created",
          })

          if (dbError) {
            console.error("Error saving order to database:", dbError)
            // Continue anyway, this is not critical
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
          // Continue anyway
        }

        return NextResponse.json({
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: razorpayKeyId,
          demo: false,
        })
      } catch (razorpayError: any) {
        console.error("Razorpay module or API error:", razorpayError)

        // If Razorpay module is not installed or API fails, fall back to demo mode
        console.log("Falling back to demo mode due to Razorpay error")

        const mockOrder = await mockRazorpay.orders.create({
          amount: Math.round(amount * 100),
          currency: currency,
          receipt: `receipt_${Date.now()}`,
          notes: {
            analysisId: analysisId || "",
            consultationId: consultationId || "",
            timestamp: new Date().toISOString(),
            mode: "demo_fallback",
            originalError: razorpayError.message,
          },
        })

        return NextResponse.json({
          success: true,
          orderId: mockOrder.id,
          amount: mockOrder.amount,
          currency: mockOrder.currency,
          key: "demo_key_12345",
          demo: true,
          message: "Demo mode - Razorpay module not available",
          warning: "Install 'razorpay' package for live payments: npm install razorpay",
        })
      }
    } catch (authError) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  } catch (error: any) {
    console.error("Payment order creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create payment order",
        details: error.message,
        suggestion: "Please install razorpay package: npm install razorpay",
      },
      { status: 500 },
    )
  }
}
