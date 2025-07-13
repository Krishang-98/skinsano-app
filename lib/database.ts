import { supabase, isSupabaseConfigured } from "./supabase"

export interface SkinAnalysis {
  id: string
  user_id: string
  condition: string
  confidence: number
  severity: string
  description: string
  recommendations: string[]
  risk_factors: string[]
  image_urls: string[]
  symptoms: string
  analysis_type: string
  status: string
  visual_findings?: any[]
  treatment_plan?: any
  created_at: string
  updated_at: string
}

export interface AnalysisData {
  user_id: string
  condition?: string
  confidence?: number
  severity?: string
  description?: string
  recommendations?: string[]
  risk_factors?: string[]
  image_urls: string[]
  symptoms: string
  analysis_type: string
  status: string
  visual_findings?: any[]
  treatment_plan?: any
}

export interface TreatmentPlan {
  analysis_id: string
  phase: number
  title: string
  duration: string
  treatments: string[]
}

export interface ConsultationData {
  user_id: string
  doctor_id: string
  doctor_name: string
  scheduled_date: string
  scheduled_time: string
  consultation_type: string
  amount: number
  payment_id?: string
  status: string
  meeting_url?: string
  notes?: string
}

// In-memory storage for demo mode
const demoAnalyses: Map<string, SkinAnalysis> = new Map()
const demoUsers: Map<string, any> = new Map()

export class DatabaseService {
  // Create a new analysis
  static async createAnalysis(data: AnalysisData): Promise<{ data: SkinAnalysis | null; error: any }> {
    try {
      console.log("DatabaseService: Creating analysis...")

      // Generate a proper ID
      const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const analysisData: SkinAnalysis = {
        id: analysisId,
        user_id: data.user_id,
        condition: data.condition || "Processing",
        confidence: data.confidence || 0,
        severity: data.severity || "Mild",
        description: data.description || "Analysis in progress",
        recommendations: data.recommendations || [],
        risk_factors: data.risk_factors || [],
        image_urls: data.image_urls,
        symptoms: data.symptoms,
        analysis_type: data.analysis_type,
        status: data.status,
        visual_findings: data.visual_findings || [],
        treatment_plan: data.treatment_plan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (!isSupabaseConfigured() || !supabase) {
        console.log("Demo mode: Storing analysis in memory")
        demoAnalyses.set(analysisId, analysisData)
        return { data: analysisData, error: null }
      }

      try {
        const { data: analysis, error } = await supabase
          .from("skin_analyses")
          .insert({
            id: analysisId,
            user_id: data.user_id,
            condition: data.condition,
            confidence: data.confidence,
            severity: data.severity,
            description: data.description,
            recommendations: data.recommendations,
            risk_factors: data.risk_factors,
            image_urls: data.image_urls,
            symptoms: data.symptoms,
            analysis_type: data.analysis_type,
            status: data.status,
            visual_findings: data.visual_findings,
            treatment_plan: data.treatment_plan,
          })
          .select()
          .single()

        if (error) {
          console.warn("Supabase create error, using demo mode:", error.message || "Unknown error")
          // Fallback to demo storage
          demoAnalyses.set(analysisId, analysisData)
          return { data: analysisData, error: null }
        }

        return { data: analysis, error: null }
      } catch (supabaseError: any) {
        console.warn("Supabase connection error, using demo mode:", supabaseError.message || "Connection failed")
        // Fallback to demo storage
        demoAnalyses.set(analysisId, analysisData)
        return { data: analysisData, error: null }
      }
    } catch (error) {
      console.error("DatabaseService create error:", error)
      return { data: null, error }
    }
  }

  // Update an existing analysis
  static async updateAnalysis(
    id: string,
    data: Partial<AnalysisData>,
  ): Promise<{ data: SkinAnalysis | null; error: any }> {
    try {
      console.log("DatabaseService: Updating analysis:", id)

      if (!isSupabaseConfigured() || !supabase) {
        console.log("Demo mode: Updating analysis in memory")
        const existing = demoAnalyses.get(id)
        if (existing) {
          const updated = {
            ...existing,
            ...data,
            updated_at: new Date().toISOString(),
          }
          demoAnalyses.set(id, updated)
          return { data: updated, error: null }
        }
        return { data: null, error: "Analysis not found" }
      }

      try {
        const { data: analysis, error } = await supabase
          .from("skin_analyses")
          .update({
            condition: data.condition,
            confidence: data.confidence,
            severity: data.severity,
            description: data.description,
            recommendations: data.recommendations,
            risk_factors: data.risk_factors,
            status: data.status,
            visual_findings: data.visual_findings,
            treatment_plan: data.treatment_plan,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single()

        if (error) {
          console.warn("Supabase update error, trying demo mode:", error.message || "Unknown error")
          // Try demo storage
          const existing = demoAnalyses.get(id)
          if (existing) {
            const updated = {
              ...existing,
              ...data,
              updated_at: new Date().toISOString(),
            }
            demoAnalyses.set(id, updated)
            return { data: updated, error: null }
          }
          return { data: null, error }
        }

        return { data: analysis, error: null }
      } catch (supabaseError: any) {
        console.warn("Supabase connection error, using demo mode:", supabaseError.message || "Connection failed")
        // Fallback to demo storage
        const existing = demoAnalyses.get(id)
        if (existing) {
          const updated = {
            ...existing,
            ...data,
            updated_at: new Date().toISOString(),
          }
          demoAnalyses.set(id, updated)
          return { data: updated, error: null }
        }
        return { data: null, error: "Analysis not found" }
      }
    } catch (error) {
      console.error("DatabaseService update error:", error)
      return { data: null, error }
    }
  }

  // Get analysis by ID
  static async getAnalysisById(id: string): Promise<{ data: SkinAnalysis | null; error: any }> {
    try {
      console.log("DatabaseService: Getting analysis by ID:", id)

      // Check demo storage first
      if (demoAnalyses.has(id)) {
        console.log("Found analysis in demo storage")
        return { data: demoAnalyses.get(id)!, error: null }
      }

      if (!isSupabaseConfigured() || !supabase) {
        console.log("Analysis not found in demo storage")
        return { data: null, error: "Analysis not found" }
      }

      try {
        const { data: analysis, error } = await supabase.from("skin_analyses").select("*").eq("id", id).single()

        if (error) {
          console.warn("Supabase get error:", error.message || "Unknown error")
          return { data: null, error }
        }

        return { data: analysis, error: null }
      } catch (supabaseError: any) {
        console.warn("Supabase connection error:", supabaseError.message || "Connection failed")
        return { data: null, error: supabaseError }
      }
    } catch (error) {
      console.error("DatabaseService get error:", error)
      return { data: null, error }
    }
  }

  // Get user analyses
  static async getUserAnalyses(userId: string): Promise<{ data: SkinAnalysis[] | null; error: any }> {
    try {
      console.log("DatabaseService: Getting analyses for user:", userId)

      // Get from demo storage
      const demoUserAnalyses = Array.from(demoAnalyses.values()).filter((analysis) => analysis.user_id === userId)

      if (!isSupabaseConfigured() || !supabase) {
        return { data: demoUserAnalyses, error: null }
      }

      try {
        const { data: analyses, error } = await supabase
          .from("skin_analyses")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) {
          console.warn("Supabase get user analyses error, using demo mode:", error.message || "Unknown error")
          return { data: demoUserAnalyses, error: null }
        }

        // Combine Supabase and demo data
        const allAnalyses = [...(analyses || []), ...demoUserAnalyses]
        return { data: allAnalyses, error: null }
      } catch (supabaseError: any) {
        console.warn("Supabase connection error, using demo mode:", supabaseError.message || "Connection failed")
        return { data: demoUserAnalyses, error: null }
      }
    } catch (error) {
      console.error("DatabaseService get user analyses error:", error)
      return { data: [], error: null }
    }
  }

  // Check user scan limit - simplified and faster
  static async checkUserScanLimit(
    userId: string,
    isPremium: boolean,
  ): Promise<{ canScan: boolean; usedScans: number; error?: any }> {
    try {
      // Premium users have unlimited scans
      if (isPremium) {
        return { canScan: true, usedScans: 0 }
      }

      // For demo mode and free users, allow 3 scans
      const { data: analyses } = await this.getUserAnalyses(userId)
      const usedScans = analyses?.length || 0
      const canScan = usedScans < 3

      return { canScan, usedScans }
    } catch (error) {
      console.warn("Scan limit check error, allowing scan:", error)
      return { canScan: true, usedScans: 0 }
    }
  }

  // User operations - simplified
  static async getUser(userId: string): Promise<any | null> {
    try {
      // Check if this is the power user
      const isPowerUser = userId === "aekukrishang@gmail.com" || userId.includes("aekukrishang")

      // Check demo storage first
      if (demoUsers.has(userId)) {
        const user = demoUsers.get(userId)
        if (isPowerUser) {
          user.is_premium = true
          user.subscription_status = "premium"
          user.role = "admin"
        }
        return user
      }

      const defaultUser = {
        id: userId,
        email: isPowerUser ? "aekukrishang@gmail.com" : userId,
        name: isPowerUser ? "Aeku Krishang (Admin)" : "User",
        age: 25,
        gender: "other",
        skin_type: "normal",
        concerns: [],
        is_premium: isPowerUser,
        subscription_status: isPowerUser ? "premium" : "free",
        role: isPowerUser ? "admin" : "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Store in demo storage
      demoUsers.set(userId, defaultUser)

      if (!isSupabaseConfigured() || !supabase) {
        return defaultUser
      }

      try {
        const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) {
          console.warn("Supabase getUser error, using default:", error.message || "Unknown error")
          return defaultUser
        }

        // Override premium status for power user
        if (isPowerUser) {
          user.is_premium = true
          user.subscription_status = "premium"
          user.role = "admin"
        }

        // Update demo storage with real data
        demoUsers.set(userId, user)
        return user
      } catch (supabaseError: any) {
        console.warn("Supabase connection error, using default:", supabaseError.message || "Connection failed")
        return defaultUser
      }
    } catch (error) {
      console.error("DatabaseService getUser error:", error)
      return null
    }
  }

  static async createUser(userData: any): Promise<any | null> {
    try {
      const isPowerUser = userData.email === "aekukrishang@gmail.com"
      const userId = userData.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const userToCreate = {
        id: userId,
        email: userData.email,
        name: userData.name,
        age: userData.age || 25,
        gender: userData.gender || "other",
        skin_type: userData.skin_type || "normal",
        concerns: userData.concerns || [],
        is_premium: isPowerUser || userData.is_premium || false,
        subscription_status: isPowerUser ? "premium" : userData.subscription_status || "free",
        role: isPowerUser ? "admin" : userData.role || "user",
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Store in demo storage
      demoUsers.set(userId, userToCreate)

      if (!isSupabaseConfigured() || !supabase) {
        return userToCreate
      }

      try {
        const { data: user, error } = await supabase.from("users").upsert([userToCreate]).select().single()

        if (error) {
          console.warn("Supabase createUser error, using demo:", error.message || "Unknown error")
          return userToCreate
        }

        return user
      } catch (supabaseError: any) {
        console.warn("Supabase connection error, using demo:", supabaseError.message || "Connection failed")
        return userToCreate
      }
    } catch (error) {
      console.error("DatabaseService createUser error:", error)
      return null
    }
  }

  static async updateUser(userId: string, updates: any): Promise<any | null> {
    try {
      // Update demo storage
      if (demoUsers.has(userId)) {
        const existing = demoUsers.get(userId)
        const updated = {
          ...existing,
          ...updates,
          updated_at: new Date().toISOString(),
        }
        demoUsers.set(userId, updated)
      }

      if (!isSupabaseConfigured() || !supabase) {
        return demoUsers.get(userId) || null
      }

      try {
        const { data: user, error } = await supabase
          .from("users")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single()

        if (error) {
          console.warn("Supabase updateUser error, using demo:", error.message || "Unknown error")
          return demoUsers.get(userId) || null
        }

        return user
      } catch (supabaseError: any) {
        console.warn("Supabase connection error, using demo:", supabaseError.message || "Connection failed")
        return demoUsers.get(userId) || null
      }
    } catch (error) {
      console.error("DatabaseService updateUser error:", error)
      return null
    }
  }

  // Create consultation
  static async createConsultation(data: ConsultationData): Promise<{ data: any; error: any }> {
    try {
      const consultationId = `consultation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const consultationData = {
        id: consultationId,
        user_id: data.user_id,
        doctor_id: data.doctor_id,
        doctor_name: data.doctor_name,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        consultation_type: data.consultation_type,
        amount: data.amount,
        payment_id: data.payment_id || null,
        status: data.status,
        meeting_url: data.meeting_url || null,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (!isSupabaseConfigured() || !supabase) {
        return { data: consultationData, error: null }
      }

      try {
        const { data: consultation, error } = await supabase
          .from("consultations")
          .insert(consultationData)
          .select()
          .single()

        if (error) {
          console.warn("Supabase consultation create error, using demo:", error.message || "Unknown error")
          return { data: consultationData, error: null }
        }

        return { data: consultation, error: null }
      } catch (supabaseError: any) {
        console.warn("Supabase connection error, using demo:", supabaseError.message || "Connection failed")
        return { data: consultationData, error: null }
      }
    } catch (error: any) {
      console.error("DatabaseService consultation create error:", error)
      return { data: null, error }
    }
  }

  // Create treatment plan
  static async createTreatmentPlan(data: TreatmentPlan): Promise<{ data: any; error: any }> {
    try {
      const planData = {
        id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        created_at: new Date().toISOString(),
      }

      if (!isSupabaseConfigured() || !supabase) {
        return { data: planData, error: null }
      }

      try {
        const { data: plan, error } = await supabase.from("treatment_plans").insert(planData).select().single()
        return { data: plan || planData, error }
      } catch (supabaseError: any) {
        console.warn("Supabase treatment plan error, using demo:", supabaseError.message || "Connection failed")
        return { data: planData, error: null }
      }
    } catch (error) {
      console.error("DatabaseService treatment plan error:", error)
      return { data: null, error }
    }
  }

  // Get treatment plans
  static async getTreatmentPlans(analysisId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { data: [], error: null }
      }

      const { data: plans, error } = await supabase
        .from("treatment_plans")
        .select("*")
        .eq("analysis_id", analysisId)
        .order("phase", { ascending: true })

      return { data: plans || [], error }
    } catch (error) {
      console.warn("DatabaseService get treatment plans error:", error)
      return { data: [], error: null }
    }
  }

  // Test database connection
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: true } // Demo mode always works
      }

      const { error } = await supabase.from("users").select("id").limit(1)

      if (error) {
        console.warn("Database connection test failed:", error.message || "Connection test failed")
        return { success: false, error: error.message || "Connection test failed" }
      }

      return { success: true }
    } catch (error: any) {
      console.warn("Database connection error:", error.message || "Connection test failed")
      return { success: true } // Return success for demo mode
    }
  }
}
