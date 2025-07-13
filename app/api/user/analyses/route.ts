import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    // Get user's analyses
    const { data: analyses, error } = await DatabaseService.getUserAnalyses(user.id, limit)

    if (error) {
      console.error("Error fetching analyses:", error)
      return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
    }

    return NextResponse.json({ analyses: analyses || [] })
  } catch (error) {
    console.error("Get user analyses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
