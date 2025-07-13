// Mock API functions that simulate real backend calls
// This replaces expensive AI APIs with realistic fake data

export interface AnalysisResult {
  id: string
  condition: string
  confidence: number
  severity: "Mild" | "Moderate" | "Severe"
  description: string
  recommendations: string[]
  riskFactors: string[]
  treatmentPlan: {
    phase: number
    title: string
    duration: string
    treatments: string[]
  }[]
}

export interface User {
  id: string
  name: string
  email: string
  age?: number
  gender?: string
  skinType?: string
  concerns?: string[]
}

// Simulate skin analysis with realistic results
export async function mockAnalyzeSkin(imageData: string, symptoms: string): Promise<AnalysisResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock analysis based on common skin conditions
  const conditions = [
    {
      condition: "Seborrheic Dermatitis",
      confidence: 94,
      severity: "Moderate" as const,
      description: "A common skin condition that causes scaly, itchy rashes mainly on the scalp and face.",
      recommendations: [
        "Use antifungal shampoo 2-3 times per week",
        "Apply gentle moisturizer daily",
        "Avoid harsh soaps and hot water",
        "Consider stress management techniques",
      ],
      riskFactors: ["Stress", "Weather changes", "Hormonal fluctuations"],
      treatmentPlan: [
        {
          phase: 1,
          title: "Immediate Relief",
          duration: "1-2 weeks",
          treatments: [
            "Apply antifungal cream twice daily",
            "Use gentle, fragrance-free cleanser",
            "Avoid harsh scrubbing",
          ],
        },
        {
          phase: 2,
          title: "Stabilization",
          duration: "2-4 weeks",
          treatments: ["Continue antifungal treatment", "Introduce moisturizing routine", "Monitor for improvement"],
        },
      ],
    },
    {
      condition: "Contact Dermatitis",
      confidence: 87,
      severity: "Mild" as const,
      description: "Skin inflammation caused by contact with an irritant or allergen.",
      recommendations: [
        "Identify and avoid triggers",
        "Use hypoallergenic products",
        "Apply cool compresses",
        "Use topical corticosteroids if needed",
      ],
      riskFactors: ["Allergies", "Sensitive skin", "Environmental factors"],
      treatmentPlan: [
        {
          phase: 1,
          title: "Immediate Care",
          duration: "3-7 days",
          treatments: ["Remove irritant immediately", "Wash with cool water", "Apply soothing cream"],
        },
      ],
    },
    {
      condition: "Acne Vulgaris",
      confidence: 91,
      severity: "Moderate" as const,
      description: "Common skin condition characterized by clogged pores and inflammation.",
      recommendations: [
        "Use salicylic acid cleanser",
        "Apply benzoyl peroxide treatment",
        "Maintain consistent skincare routine",
        "Avoid picking or squeezing",
      ],
      riskFactors: ["Hormones", "Genetics", "Diet", "Stress"],
      treatmentPlan: [
        {
          phase: 1,
          title: "Initial Treatment",
          duration: "2-4 weeks",
          treatments: ["Start gentle acne cleanser", "Apply spot treatment", "Use oil-free moisturizer"],
        },
      ],
    },
  ]

  // Randomly select a condition (in real app, this would be AI analysis)
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]

  return {
    id: `analysis_${Date.now()}`,
    ...randomCondition,
  }
}

// Mock user authentication
export async function mockSignIn(email: string, password: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simple mock - in real app, this would check against database
  if (email && password.length >= 6) {
    return {
      id: `user_${Date.now()}`,
      name: email.split("@")[0],
      email: email,
    }
  }

  return null
}

export async function mockSignUp(name: string, email: string, password: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simple validation
  if (name && email && password.length >= 6) {
    return {
      id: `user_${Date.now()}`,
      name: name,
      email: email,
    }
  }

  return null
}

// Mock user profile update
export async function mockUpdateProfile(userId: string, profileData: Partial<User>): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    id: userId,
    name: "Alex Johnson",
    email: "alex@example.com",
    ...profileData,
  }
}

// Mock consultation booking
export async function mockBookConsultation(doctorId: string, date: Date, time: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Always succeed for demo
  return true
}

// Local storage helpers for persistence
export const storage = {
  setUser: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("skinsano_user", JSON.stringify(user))
    }
  },

  getUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("skinsano_user")
      return userData ? JSON.parse(userData) : null
    }
    return null
  },

  removeUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("skinsano_user")
    }
  },

  setAnalysis: (analysis: AnalysisResult) => {
    if (typeof window !== "undefined") {
      const analyses = storage.getAnalyses()
      analyses.unshift(analysis) // Add to beginning
      localStorage.setItem("skinsano_analyses", JSON.stringify(analyses))
    }
  },

  getAnalyses: (): AnalysisResult[] => {
    if (typeof window !== "undefined") {
      const analysesData = localStorage.getItem("skinsano_analyses")
      return analysesData ? JSON.parse(analysesData) : []
    }
    return []
  },
}
