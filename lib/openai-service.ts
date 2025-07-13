interface OpenAIAnalysisRequest {
  symptoms: string
  analysisType: "free" | "premium"
  imageCount: number
}

interface OpenAIAnalysisResult {
  condition: string
  confidence: number
  severity: "Mild" | "Moderate" | "Severe"
  description: string
  recommendations: string[]
  riskFactors: string[]
  visualFindings: string[]
  treatmentPlan?: {
    phase: number
    title: string
    duration: string
    treatments: string[]
  }[]
  error?: string
}

export class OpenAIService {
  static async analyzeSkin(request: OpenAIAnalysisRequest): Promise<OpenAIAnalysisResult> {
    try {
      console.log("OpenAI Service: Starting analysis")

      // Check if we're in a build environment or missing dependencies
      if (typeof window === "undefined" && !process.env.OPENAI_API_KEY) {
        console.log("Build environment detected, using fallback")
        return this.getFallbackAnalysis(request)
      }

      // Try to use AI SDK if available
      try {
        const { generateText } = await import("ai")
        const { openai } = await import("@ai-sdk/openai")

        if (!process.env.OPENAI_API_KEY) {
          console.warn("OpenAI API key not found, using fallback")
          return this.getFallbackAnalysis(request)
        }

        const model = "gpt-4o-mini"
        const prompt = this.buildAnalysisPrompt(request)

        console.log("Calling OpenAI with model:", model)

        const { text } = await generateText({
          model: openai(model),
          prompt,
          maxTokens: 1500,
          temperature: 0.3,
        })

        console.log("OpenAI response received")
        const analysis = this.parseResponse(text)
        return analysis
      } catch (importError) {
        console.log("AI SDK not available, using fallback:", importError.message)
        return this.getFallbackAnalysis(request)
      }
    } catch (error: any) {
      console.error("OpenAI analysis error:", error)
      return this.getFallbackAnalysis(request)
    }
  }

  private static buildAnalysisPrompt(request: OpenAIAnalysisRequest): string {
    return `
You are a professional dermatologist AI assistant. Analyze the following skin condition symptoms and provide a medical assessment.

PATIENT SYMPTOMS: "${request.symptoms}"
ANALYSIS TYPE: ${request.analysisType}
IMAGES PROVIDED: ${request.imageCount > 0 ? "Yes" : "No"}

Provide your analysis in this EXACT JSON format:

{
  "condition": "Primary skin condition diagnosis",
  "confidence": 85,
  "severity": "Mild|Moderate|Severe",
  "description": "Detailed medical description of the condition",
  "recommendations": [
    "Primary treatment recommendation",
    "Secondary care instruction",
    "Lifestyle modification",
    "Follow-up guidance"
  ],
  "riskFactors": [
    "Primary risk factor",
    "Secondary risk factor",
    "Environmental factor"
  ],
  "visualFindings": [
    "Key visual characteristic observed",
    "Secondary finding",
    "Distribution pattern"
  ]${
    request.analysisType === "premium"
      ? `,
  "treatmentPlan": [
    {
      "phase": 1,
      "title": "Initial Treatment",
      "duration": "1-2 weeks",
      "treatments": [
        "Primary treatment with specific instructions",
        "Supportive care measure"
      ]
    },
    {
      "phase": 2,
      "title": "Maintenance",
      "duration": "2-4 weeks",
      "treatments": [
        "Long-term management",
        "Prevention strategy"
      ]
    }
  ]`
      : ""
  }
}

IMPORTANT:
- Base diagnosis on symptoms described
- Use medical terminology appropriately
- Provide confidence level 70-95%
- Always recommend professional consultation for serious conditions
- Return ONLY the JSON object, no additional text
`
  }

  private static parseResponse(content: string): OpenAIAnalysisResult {
    try {
      console.log("Parsing OpenAI response...")

      let cleanContent = content.trim()
      cleanContent = cleanContent.replace(/```json\s*/g, "").replace(/```\s*/g, "")

      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanContent = jsonMatch[0]
      }

      const parsed = JSON.parse(cleanContent)

      const result: OpenAIAnalysisResult = {
        condition: parsed.condition || "Skin Condition Detected",
        confidence: Math.min(Math.max(parsed.confidence || 80, 70), 95),
        severity: ["Mild", "Moderate", "Severe"].includes(parsed.severity) ? parsed.severity : "Moderate",
        description: parsed.description || "A skin condition has been identified based on the symptoms described.",
        recommendations:
          Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
            ? parsed.recommendations
            : [
                "Consult with a dermatologist for professional evaluation",
                "Keep the affected area clean and dry",
                "Avoid harsh soaps or irritants",
                "Monitor for any changes in symptoms",
                "Apply gentle, fragrance-free moisturizer if skin is dry",
              ],
        riskFactors:
          Array.isArray(parsed.riskFactors) && parsed.riskFactors.length > 0
            ? parsed.riskFactors
            : ["Skin sensitivity", "Environmental factors", "Genetic predisposition"],
        visualFindings:
          Array.isArray(parsed.visualFindings) && parsed.visualFindings.length > 0
            ? parsed.visualFindings
            : ["Skin changes consistent with described symptoms"],
        treatmentPlan: parsed.treatmentPlan || undefined,
      }

      console.log("Successfully parsed response")
      return result
    } catch (error: any) {
      console.error("Error parsing response:", error.message)
      return this.getFallbackAnalysis({ symptoms: "parsing error", analysisType: "free", imageCount: 0 })
    }
  }

  private static getFallbackAnalysis(request: OpenAIAnalysisRequest): OpenAIAnalysisResult {
    const symptoms = request.symptoms.toLowerCase()

    let condition = "General Skin Condition"
    let description = "Based on your symptoms, you may have a common skin condition."
    let severity: "Mild" | "Moderate" | "Severe" = "Mild"
    const confidence = 75

    if (symptoms.includes("red") || symptoms.includes("rash")) {
      condition = "Skin Irritation/Rash"
      description =
        "You appear to have skin irritation or a rash. This could be due to various factors including allergies, irritants, or skin conditions."
      severity = symptoms.includes("severe") || symptoms.includes("painful") ? "Moderate" : "Mild"
    } else if (symptoms.includes("dry") || symptoms.includes("flaky")) {
      condition = "Dry Skin (Xerosis)"
      description = "Your symptoms suggest dry skin, which is common and usually manageable with proper moisturizing."
      severity = "Mild"
    } else if (symptoms.includes("itch") || symptoms.includes("scratch")) {
      condition = "Itchy Skin Condition"
      description =
        "You're experiencing itchy skin, which could be due to various causes including dry skin, allergies, or dermatitis."
      severity = "Mild"
    } else if (symptoms.includes("acne") || symptoms.includes("pimple")) {
      condition = "Acne"
      description = "Your symptoms are consistent with acne, a common skin condition affecting hair follicles."
      severity = "Mild"
    }

    return {
      condition,
      confidence,
      severity,
      description,
      recommendations: [
        "Consult with a dermatologist for accurate diagnosis",
        "Keep the affected area clean with gentle cleansers",
        "Avoid scratching or picking at the skin",
        "Use fragrance-free, hypoallergenic products",
        "Monitor symptoms and seek medical attention if they worsen",
      ],
      riskFactors: ["Skin sensitivity", "Environmental factors", "Possible allergic reactions"],
      visualFindings: [
        "Skin changes as described in symptoms",
        "Localized skin condition",
        "Consistent with common dermatological presentations",
      ],
      treatmentPlan:
        request.analysisType === "premium"
          ? [
              {
                phase: 1,
                title: "Initial Care",
                duration: "1-2 weeks",
                treatments: ["Gentle cleansing routine", "Apply appropriate moisturizer", "Avoid known irritants"],
              },
              {
                phase: 2,
                title: "Ongoing Management",
                duration: "2-4 weeks",
                treatments: [
                  "Continue gentle skincare routine",
                  "Monitor for improvement",
                  "Schedule dermatologist consultation if no improvement",
                ],
              },
            ]
          : undefined,
    }
  }
}
