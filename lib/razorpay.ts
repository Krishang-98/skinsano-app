declare global {
  interface Window {
    Razorpay: any
  }
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
    contact?: string
  }
  theme: {
    color: string
  }
  modal: {
    ondismiss: () => void
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export class RazorpayService {
  private static isLoaded = false

  static async loadRazorpay(): Promise<boolean> {
    if (this.isLoaded) return true

    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => {
        this.isLoaded = true
        resolve(true)
      }
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  static async createOrder(amount: number, currency = "INR", analysisId?: string, consultationId?: string) {
    try {
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          analysisId,
          consultationId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order")
      }

      return data
    } catch (error) {
      console.error("Error creating Razorpay order:", error)
      throw error
    }
  }

  static async verifyPayment(paymentData: {
    paymentId: string
    razorpayPaymentId: string
    razorpayOrderId: string
    razorpaySignature: string
  }) {
    try {
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(paymentData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment verification failed")
      }

      return data
    } catch (error) {
      console.error("Error verifying payment:", error)
      throw error
    }
  }

  static async openCheckout(options: RazorpayOptions): Promise<void> {
    const isLoaded = await this.loadRazorpay()

    if (!isLoaded) {
      throw new Error("Failed to load Razorpay")
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  private static getAuthToken(): string | null {
    if (typeof window === "undefined") return null

    try {
      const session = localStorage.getItem("skinsano_session")
      if (session) {
        const parsed = JSON.parse(session)
        return parsed.access_token
      }
    } catch (error) {
      console.error("Error getting auth token:", error)
    }

    return null
  }
}
