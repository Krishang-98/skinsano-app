import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface AnalysisRequest {
  symptoms: string
  imageUrls?: string[]
  analysisType: "free" | "premium"
  userId: string
}

async function analyzeWithAI(request: AnalysisRequest) {
  try {
    console.log("Starting real AI analysis...")

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.")
    }

    const prompt = `
You are an expert dermatologist AI. Analyze the following skin condition symptoms and provide a professional medical assessment.

PATIENT SYMPTOMS: "${request.symptoms}"

Please provide a comprehensive dermatological analysis in the following JSON format:

{
  "condition": "Primary diagnosis based on symptoms",
  "confidence": 85,
  "severity": "Mild|Moderate|Severe",
  "description": "Detailed medical explanation of the condition, causes, and characteristics",
  "recommendations": [
    "Specific treatment recommendation 1",
    "Specific treatment recommendation 2",
    "Specific treatment recommendation 3",
    "When to see a doctor",
    "Preventive measures"
  ],
  "riskFactors": [
    "Primary risk factor",
    "Secondary risk factor",
    "Environmental factors"
  ],
  "urgency": "Low|Medium|High",
  "followUp": "Recommended follow-up timeline",
  "differentialDiagnosis": ["Alternative condition 1", "Alternative condition 2"]
}

IMPORTANT GUIDELINES:
- Base analysis ONLY on the symptoms provided
- Use proper medical terminology
- Provide evidence-based recommendations
- Include urgency level for medical attention
- Confidence should be realistic (70-95%)
- Always recommend professional consultation for definitive diagnosis
- Be specific about treatment recommendations
- Consider differential diagnoses

Respond with ONLY the JSON object, no additional text.
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 2000,
      temperature: 0.1, // Low temperature for medical accuracy
    })

    console.log("AI analysis completed, parsing response...")

    // Parse the AI response
    let analysis
    try {
      const cleanText = text.trim().replace(/```json\s*|\s*```/g, "")
      analysis = JSON.parse(cleanText)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      throw new Error("Invalid AI response format")
    }

    // Validate required fields
    if (!analysis.condition || !analysis.description || !analysis.recommendations) {
      throw new Error("Incomplete AI analysis response")
    }

    // Ensure confidence is within valid range
    analysis.confidence = Math.min(Math.max(analysis.confidence || 75, 70), 95)

    // Add treatment plan for premium analysis
    if (request.analysisType === "premium") {
      analysis.treatmentPlan = {
        phase: 1,
        title: "Comprehensive Treatment Protocol",
        duration: "2-6 weeks",
        treatments: [
          "Follow prescribed medication regimen",
          "Implement specialized skincare routine",
          "Monitor symptoms with daily documentation",
          "Schedule follow-up appointments as recommended",
          "Avoid identified triggers and irritants",
        ],
        expectedImprovement: "Significant improvement expected within 2-4 weeks with proper treatment",
      }
    }

    return analysis
  } catch (error: any) {
    console.error("AI analysis error:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== REAL AI ANALYSIS API CALLED ===")

    const body = await request.json()
    const { symptoms, analysisType = "free", userId = "anonymous" } = body

    console.log("Request received:", {
      hasSymptoms: !!symptoms,
      symptomsLength: symptoms?.length || 0,
      analysisType,
      userId,
    })

    // Validate input
    if (!symptoms || typeof symptoms !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Symptoms description is required",
        },
        { status: 400 },
      )
    }

    if (symptoms.trim().length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a more detailed description of your symptoms (at least 20 characters)",
        },
        { status: 400 },
      )
    }

    // Perform AI analysis
    console.log("Calling AI analysis service...")
    const aiAnalysis = await analyzeWithAI({
      symptoms: symptoms.trim(),
      analysisType,
      userId,
    })

    // Create analysis record
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const analysisData = {
      id: analysisId,
      user_id: userId,
      condition: aiAnalysis.condition,
      confidence: aiAnalysis.confidence,
      severity: aiAnalysis.severity,
      description: aiAnalysis.description,
      recommendations: aiAnalysis.recommendations,
      risk_factors: aiAnalysis.riskFactors || [],
      image_urls: [],
      symptoms: symptoms.trim(),
      analysis_type: analysisType,
      status: "completed",
      urgency: aiAnalysis.urgency || "Medium",
      follow_up: aiAnalysis.followUp || "Consult healthcare provider if symptoms persist",
      differential_diagnosis: aiAnalysis.differentialDiagnosis || [],
      visual_findings: [
        {
          finding: "Symptom Analysis",
          location: "As described",
          severity: aiAnalysis.severity,
          description: "Analysis based on detailed symptom description",
        },
      ],
      treatment_plan: aiAnalysis.treatmentPlan || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Real AI analysis completed successfully:", {
      id: analysisId,
      condition: aiAnalysis.condition,
      confidence: aiAnalysis.confidence,
      urgency: aiAnalysis.urgency,
    })

    return NextResponse.json({
      success: true,
      data: analysisData,
      message: "Professional AI analysis completed successfully",
    })
  } catch (error: any) {
    console.error("Analysis API error:", error)

    // Return appropriate error response
    if (error.message.includes("OpenAI API key")) {
      return NextResponse.json(
        {
          success: false,
          error: "AI analysis service is currently unavailable. Please try again later.",
          details: "Service configuration issue",
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Analysis failed. Please try again with a more detailed description.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Real AI Analysis API is running",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    aiEnabled: !!process.env.OPENAI_API_KEY,
  })
}
