import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: analysisId } = await params

    if (!analysisId) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 })
    }

    console.log("Fetching analysis:", analysisId)

    // Get analysis from database
    const { data: analysis, error } = await DatabaseService.getAnalysisById(analysisId)

    if (error) {
      console.error("Error fetching analysis:", error)
      return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 })
    }

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    // Get treatment plans if available
    const { data: treatmentPlans } = await DatabaseService.getTreatmentPlans(analysisId)

    return NextResponse.json({
      success: true,
      analysis,
      treatmentPlans: treatmentPlans || [],
    })
  } catch (error) {
    console.error("Analysis fetch error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
