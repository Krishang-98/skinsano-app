import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "your-supabase-url" &&
    supabaseAnonKey !== "your-supabase-anon-key" &&
    supabaseUrl.includes("supabase.co")
  )
}

// Create Supabase client only if properly configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

// Safe Supabase call wrapper - NOW EXPORTED
export async function safeSupabaseCall<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
): Promise<{ data: T | null; error: any }> {
  try {
    if (!supabase) {
      return {
        data: null,
        error: { message: "Supabase not configured - using demo mode" },
      }
    }
    return await operation()
  } catch (error) {
    console.error("Supabase operation failed:", error)
    return {
      data: null,
      error: { message: "Database operation failed" },
    }
  }
}

// Database types
export interface User {
  id: string
  email: string
  name: string
  age?: number
  gender?: string
  skin_type?: string
  concerns?: string[]
  is_premium: boolean
  subscription_status: "free" | "premium" | "expired"
  role: "user" | "admin" | "power_user" | "doctor"
  created_at: string
  updated_at: string
}

export interface SkinAnalysis {
  id: string
  user_id: string
  condition: string
  confidence: number
  severity: "Mild" | "Moderate" | "Severe"
  description: string
  recommendations: string[]
  risk_factors: string[]
  image_urls: string[]
  symptoms: string
  analysis_type: "free" | "premium"
  status: "processing" | "completed" | "failed"
  created_at: string
  updated_at: string
}

export interface Consultation {
  id: string
  user_id: string
  doctor_id: string
  doctor_name: string
  scheduled_date: string
  scheduled_time: string
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  meeting_url?: string
  notes?: string
  price: number
  created_at: string
  updated_at: string
}

// Helper functions for common operations
export const getUserProfile = async (userId: string) => {
  return safeSupabaseCall(async () => {
    return await supabase!.from("users").select("*").eq("id", userId).single()
  })
}

export const getUserAnalyses = async (userId: string) => {
  return safeSupabaseCall(async () => {
    return await supabase!
      .from("skin_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  })
}

export const createAnalysis = async (analysis: Partial<SkinAnalysis>) => {
  return safeSupabaseCall(async () => {
    return await supabase!.from("skin_analyses").insert([analysis]).select().single()
  })
}
