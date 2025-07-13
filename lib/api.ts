import { supabase } from "./supabase"

// Mock AI analysis function (replace with real AI service later)
export async function analyzeSkin(imageUrls: string[], symptoms: string, userId: string) {
  try {
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock analysis result
    const mockConditions = [
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
        risk_factors: ["Stress", "Weather changes", "Hormonal fluctuations"],
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
        risk_factors: ["Allergies", "Sensitive skin", "Environmental factors"],
      },
    ]

    const randomResult = mockConditions[Math.floor(Math.random() * mockConditions.length)]

    // Save analysis to database
    const { data: analysis, error: analysisError } = await supabase
      .from("skin_analyses")
      .insert([
        {
          user_id: userId,
          condition: randomResult.condition,
          confidence: randomResult.confidence,
          severity: randomResult.severity,
          description: randomResult.description,
          recommendations: randomResult.recommendations,
          risk_factors: randomResult.risk_factors,
          image_urls: imageUrls,
          symptoms: symptoms,
        },
      ])
      .select()
      .single()

    if (analysisError) throw analysisError

    // Create treatment plan
    const treatmentPhases = [
      {
        analysis_id: analysis.id,
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
        analysis_id: analysis.id,
        phase: 2,
        title: "Stabilization",
        duration: "2-4 weeks",
        treatments: ["Continue antifungal treatment", "Introduce moisturizing routine", "Monitor for improvement"],
      },
    ]

    const { error: treatmentError } = await supabase.from("treatment_plans").insert(treatmentPhases)

    if (treatmentError) throw treatmentError

    return { success: true, data: analysis }
  } catch (error) {
    console.error("Analysis error:", error)
    return { success: false, error }
  }
}

export async function getUserAnalyses(userId: string) {
  try {
    const { data, error } = await supabase
      .from("skin_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Get analyses error:", error)
    return { success: false, error }
  }
}

export async function getAnalysisById(analysisId: string) {
  try {
    const { data: analysis, error: analysisError } = await supabase
      .from("skin_analyses")
      .select("*")
      .eq("id", analysisId)
      .single()

    if (analysisError) throw analysisError

    const { data: treatmentPlans, error: treatmentError } = await supabase
      .from("treatment_plans")
      .select("*")
      .eq("analysis_id", analysisId)
      .order("phase", { ascending: true })

    if (treatmentError) throw treatmentError

    return {
      success: true,
      data: {
        analysis,
        treatmentPlans,
      },
    }
  } catch (error) {
    console.error("Get analysis error:", error)
    return { success: false, error }
  }
}

export async function bookConsultation(
  userId: string,
  doctorId: string,
  doctorName: string,
  date: string,
  time: string,
) {
  try {
    const { data, error } = await supabase
      .from("consultations")
      .insert([
        {
          user_id: userId,
          doctor_id: doctorId,
          doctor_name: doctorName,
          scheduled_date: date,
          scheduled_time: time,
          status: "scheduled",
        },
      ])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Book consultation error:", error)
    return { success: false, error }
  }
}

export async function getUserConsultations(userId: string) {
  try {
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("user_id", userId)
      .order("scheduled_date", { ascending: true })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Get consultations error:", error)
    return { success: false, error }
  }
}
