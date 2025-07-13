import { type NextRequest, NextResponse } from "next/server"

// Enhanced medical knowledge base for better accuracy
const MEDICAL_CONDITIONS = {
  acne: {
    keywords: ["pimples", "blackheads", "whiteheads", "breakouts", "oily skin", "comedones"],
    description: "Acne vulgaris - a common skin condition affecting hair follicles",
    severity_indicators: ["mild", "moderate", "severe", "cystic"],
  },
  eczema: {
    keywords: ["dry", "itchy", "red patches", "flaky", "scaly", "atopic dermatitis"],
    description: "Eczema (Atopic Dermatitis) - chronic inflammatory skin condition",
    severity_indicators: ["mild", "moderate", "severe"],
  },
  psoriasis: {
    keywords: ["thick", "scaly", "silvery", "plaques", "red patches", "scaling"],
    description: "Psoriasis - autoimmune skin condition with rapid cell turnover",
    severity_indicators: ["mild", "moderate", "severe"],
  },
  dermatitis: {
    keywords: ["contact", "allergic", "irritant", "rash", "inflammation", "burning"],
    description: "Contact Dermatitis - skin inflammation from allergens or irritants",
    severity_indicators: ["mild", "moderate", "severe"],
  },
  rosacea: {
    keywords: ["facial redness", "flushing", "bumps", "burning", "stinging", "face"],
    description: "Rosacea - chronic inflammatory facial skin condition",
    severity_indicators: ["mild", "moderate", "severe"],
  },
}

function analyzeSymptoms(symptoms: string) {
  const lowerSymptoms = symptoms.toLowerCase()
  const matches = []

  for (const [condition, data] of Object.entries(MEDICAL_CONDITIONS)) {
    const keywordMatches = data.keywords.filter((keyword) => lowerSymptoms.includes(keyword.toLowerCase())).length

    if (keywordMatches > 0) {
      matches.push({
        condition,
        confidence: Math.min(keywordMatches * 20, 85), // Cap at 85%
        data,
      })
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence)
}

async function tryOpenAIAnalysis(symptoms: string, analysisType: string) {
  try {
    // Only try OpenAI if we have the API key
    if (!process.env.OPENAI_API_KEY) {
      return null
    }

    // Dynamic import to avoid build errors
    const OpenAI = (await import("openai")).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const prompt = `You are a professional dermatologist AI assistant. Analyze the following skin condition symptoms and provide a medical assessment.

PATIENT SYMPTOMS: "${symptoms}"

Please provide a structured analysis in the following JSON format:
{
  "condition": "Primary suspected condition name",
  "confidence": "Confidence level (60-95%)",
  "severity": "mild/moderate/severe",
  "description": "Detailed medical description of the condition",
  "symptoms_analysis": "Analysis of reported symptoms",
  "possible_causes": ["cause1", "cause2", "cause3"],
  "treatment_recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "when_to_see_doctor": "Specific guidance on when to seek medical attention",
  "lifestyle_tips": ["tip1", "tip2", "tip3"]
}

IMPORTANT GUIDELINES:
- Be medically accurate and evidence-based
- Use proper medical terminology
- Provide confidence levels between 60-95% (never claim 100% certainty)
- Include specific treatment recommendations
- Always recommend seeing a doctor for proper diagnosis
- Consider symptom duration, location, and severity
- Provide actionable lifestyle advice`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (aiResponse) {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    }
    return null
  } catch (error) {
    console.error("OpenAI analysis error:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symptoms, analysisType = "free", userId, imageCount = 0 } = body

    if (!symptoms || symptoms.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide detailed symptoms (minimum 10 characters)" },
        { status: 400 },
      )
    }

    console.log("Processing analysis request:", {
      symptomsLength: symptoms.length,
      analysisType,
      hasImages: imageCount > 0,
    })

    // Pre-analyze symptoms for better accuracy
    const symptomMatches = analyzeSymptoms(symptoms)
    const topMatch = symptomMatches[0]

    let analysis

    // Try OpenAI first for premium users or if we have API key
    if (analysisType === "premium" || Math.random() > 0.3) {
      const aiAnalysis = await tryOpenAIAnalysis(symptoms, analysisType)
      if (aiAnalysis) {
        analysis = {
          id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          condition: aiAnalysis.condition || topMatch?.condition || "Skin Condition",
          confidence: Math.min(Number.parseInt(aiAnalysis.confidence) || 75, 95),
          severity: aiAnalysis.severity || "moderate",
          description: aiAnalysis.description || "Skin condition requiring professional evaluation",
          symptoms_analysis: aiAnalysis.symptoms_analysis || "Symptoms suggest a dermatological condition",
          possible_causes: aiAnalysis.possible_causes || [
            "Environmental factors",
            "Genetic predisposition",
            "Lifestyle factors",
          ],
          treatment_recommendations: aiAnalysis.treatment_recommendations || [
            "Gentle skincare routine",
            "Avoid irritants",
            "Consult dermatologist",
          ],
          when_to_see_doctor: aiAnalysis.when_to_see_doctor || "If symptoms persist or worsen",
          lifestyle_tips: aiAnalysis.lifestyle_tips || [
            "Maintain good hygiene",
            "Use gentle products",
            "Protect from sun",
          ],
          timestamp: new Date().toISOString(),
          analysisType,
          userId,
          source: "openai",
        }
      }
    }

    // Intelligent fallback analysis if OpenAI fails or not available
    if (!analysis) {
      const fallbackCondition = topMatch || {
        condition: "dermatological_condition",
        confidence: 70,
        data: { description: "General skin condition requiring professional evaluation" },
      }

      analysis = {
        id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        condition: fallbackCondition.condition.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        confidence: fallbackCondition.confidence,
        severity:
          symptoms.toLowerCase().includes("severe") || symptoms.toLowerCase().includes("painful")
            ? "severe"
            : symptoms.toLowerCase().includes("mild")
              ? "mild"
              : "moderate",
        description: fallbackCondition.data.description,
        symptoms_analysis: `Based on your description: "${symptoms.substring(0, 100)}...", this appears to be a ${fallbackCondition.condition} condition.`,
        possible_causes: [
          "Environmental factors (weather, pollution)",
          "Allergic reactions to products or substances",
          "Genetic predisposition",
          "Stress and lifestyle factors",
          "Hormonal changes",
        ],
        treatment_recommendations: [
          "Maintain gentle skincare routine with mild, fragrance-free products",
          "Avoid known triggers and irritants",
          "Keep the affected area clean and moisturized",
          "Consider over-the-counter treatments appropriate for your condition",
          "Schedule consultation with a dermatologist for proper diagnosis",
        ],
        when_to_see_doctor:
          "Seek medical attention if symptoms worsen, spread, become infected, or don't improve within 1-2 weeks of home care.",
        lifestyle_tips: [
          "Use lukewarm water when washing affected areas",
          "Pat skin dry gently, don't rub",
          "Wear breathable, natural fabrics",
          "Manage stress through relaxation techniques",
          "Maintain a healthy diet rich in vitamins and antioxidants",
        ],
        timestamp: new Date().toISOString(),
        analysisType,
        userId,
        source: "intelligent_fallback",
      }
    }

    console.log("Analysis completed:", {
      id: analysis.id,
      condition: analysis.condition,
      confidence: analysis.confidence,
      source: analysis.source,
    })

    return NextResponse.json({
      success: true,
      data: analysis,
      message: "Analysis completed successfully",
    })
  } catch (error: any) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Analysis failed. Please try again.",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
