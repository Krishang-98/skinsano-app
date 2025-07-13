import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { analysisId: string } }) {
  try {
    const analysisId = params.analysisId

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

    // Get progress history
    const { data: progressHistory, error } = await DatabaseService.getProgressHistory(user.id, analysisId)

    if (error) {
      console.error("Error fetching progress history:", error)
      return NextResponse.json({ error: "Failed to fetch progress history" }, { status: 500 })
    }

    return NextResponse.json({ progressHistory: progressHistory || [] })
  } catch (error) {
    console.error("Get progress history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
