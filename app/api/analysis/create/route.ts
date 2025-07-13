import { type NextRequest, NextResponse } from "next/server"
import { OpenAIService } from "@/lib/openai-service"

export async function POST(request: NextRequest) {
  try {
    console.log("=== ANALYSIS API CALLED ===")

    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { userId, imageUrls, symptoms, analysisType } = body

    console.log("Request details:", {
      userId,
      imageUrlsCount: imageUrls?.length,
      symptomsLength: symptoms?.length,
      analysisType,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
    })

    // Validate required fields
    if (!userId) {
      console.error("Missing userId")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      console.error("Missing or invalid imageUrls")
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    if (!symptoms || symptoms.trim().length === 0) {
      console.error("Missing symptoms")
      return NextResponse.json({ error: "Symptoms description is required" }, { status: 400 })
    }

    // Prepare analysis request
    const analysisRequest = {
      imageUrls,
      symptoms: symptoms.trim(),
      analysisType: analysisType || "free",
    }

    console.log("Starting OpenAI analysis...")

    // Call the OpenAI service
    const analysis = await OpenAIService.analyzeSkin(analysisRequest)

    if (analysis.error) {
      console.error("OpenAI analysis failed:", analysis.error)
      return NextResponse.json(
        {
          success: false,
          error: "AI analysis failed",
          details: analysis.error,
        },
        { status: 500 },
      )
    }

    console.log("OpenAI analysis completed successfully:", {
      condition: analysis.condition,
      confidence: analysis.confidence,
    })

    // Create analysis object for response
    const analysisData = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      condition: analysis.condition,
      confidence: analysis.confidence,
      severity: analysis.severity,
      description: analysis.description,
      recommendations: analysis.recommendations,
      risk_factors: analysis.riskFactors,
      image_urls: [], // Don't store the actual images
      symptoms: symptoms.trim(),
      analysis_type: analysisType || "free",
      status: "completed",
      visual_findings:
        analysis.imageAnalysis?.findings?.map((finding, index) => ({
          finding: `Finding ${index + 1}`,
          location: "Analyzed area",
          severity: analysis.severity,
          description: finding,
        })) || [],
      treatment_plan: analysis.treatmentPlan?.[0] || {
        phase: 1,
        title: "Initial Care Phase",
        duration: "2-4 weeks",
        treatments: analysis.recommendations.slice(0, 4),
        expected_improvement: "Gradual improvement with consistent care",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Analysis completed successfully:", analysisData.id)

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      message: "Analysis completed successfully",
    })
  } catch (error) {
    console.error("=== ANALYSIS API ERROR ===", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
