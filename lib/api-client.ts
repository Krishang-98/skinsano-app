import { supabase, isSupabaseConfigured } from "./supabase"

export class ApiClient {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || ""

  private static async getAuthToken(): Promise<string | null> {
    if (!isSupabaseConfigured() || !supabase) {
      console.error("Supabase not configured - cannot get auth token")
      return null
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch (error) {
      console.error("Error getting auth token:", error)
      return null
    }
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data: T | null; error: any }> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`
      const token = await this.getAuthToken()

      if (!token) {
        console.error("No authentication token available")
        return { data: null, error: "Authentication required" }
      }

      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      }

      console.log("API Request:", url)

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` }
        }
        return { data: null, error: errorData.error || "Request failed" }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error: any) {
      console.error("API request error:", error)
      return { data: null, error: error.message || "Network error" }
    }
  }

  // Auth endpoints
  static async signUp(name: string, email: string, password: string) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  }

  static async signIn(email: string, password: string) {
    return this.request("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  // Analysis endpoints
  static async createAnalysis(userId: string, imageUrls: string[], symptoms: string, analysisType: string) {
    return this.request("/analysis/create", {
      method: "POST",
      body: JSON.stringify({ userId, imageUrls, symptoms, analysisType }),
    })
  }

  static async getAnalysis(analysisId: string) {
    return this.request(`/analysis/${analysisId}`, {
      method: "GET",
    })
  }

  static async getUserAnalyses(limit = 10) {
    return this.request(`/user/analyses?limit=${limit}`, {
      method: "GET",
    })
  }

  // Consultation endpoints
  static async createConsultation(
    doctorId: string,
    doctorName: string,
    scheduledDate: string,
    scheduledTime: string,
    price: number,
  ) {
    return this.request("/consultation/create", {
      method: "POST",
      body: JSON.stringify({ doctorId, doctorName, scheduledDate, scheduledTime, price }),
    })
  }

  // Progress tracking endpoints
  static async createProgressEntry(
    analysisId: string,
    date: string,
    photos: string[],
    symptomsRating: number,
    notes: string,
    improvementScore: number,
  ) {
    return this.request("/progress/create", {
      method: "POST",
      body: JSON.stringify({ analysisId, date, photos, symptomsRating, notes, improvementScore }),
    })
  }

  static async getProgressHistory(analysisId: string) {
    return this.request(`/progress/${analysisId}`, {
      method: "GET",
    })
  }

  // Payment endpoints
  static async createPaymentOrder(amount: number, currency: string, analysisId?: string, consultationId?: string) {
    return this.request("/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ amount, currency, analysisId, consultationId }),
    })
  }

  static async verifyPayment(
    paymentId: string,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature?: string,
  ) {
    return this.request("/payment/verify", {
      method: "POST",
      body: JSON.stringify({ paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature }),
    })
  }
}
 