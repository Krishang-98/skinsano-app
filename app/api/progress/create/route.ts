import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { analysisId, date, photos, symptomsRating, notes, improvementScore } = await request.json()

    // Validate input
    if (!analysisId || !date || symptomsRating === undefined || improvementScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create progress entry
    const { data: progressEntry, error: progressError } = await DatabaseService.createProgressEntry({
      user_id: user.id,
      analysis_id: analysisId,
      date,
      photos: photos || [],
      symptoms_rating: symptomsRating,
      notes: notes || "",
      improvement_score: improvementScore,
    })

    if (progressError || !progressEntry) {
      console.error("Error creating progress entry:", progressError)
      return NextResponse.json({ error: "Failed to create progress entry" }, { status: 500 })
    }

    return NextResponse.json({ progressEntry })
  } catch (error) {
    console.error("Create progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
