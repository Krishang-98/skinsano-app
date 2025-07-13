import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { doctorId, doctorName, scheduledDate, scheduledTime, price } = await request.json()

    // Validate input
    if (!doctorId || !doctorName || !scheduledDate || !scheduledTime || !price) {
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

    // Create consultation
    const { data: consultation, error: consultationError } = await DatabaseService.createConsultation({
      user_id: user.id,
      doctor_id: doctorId,
      doctor_name: doctorName,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      price: Number.parseFloat(price),
      status: "scheduled",
    })

    if (consultationError || !consultation) {
      console.error("Error creating consultation:", consultationError)
      return NextResponse.json({ error: "Failed to create consultation" }, { status: 500 })
    }

    return NextResponse.json({ consultation })
  } catch (error) {
    console.error("Create consultation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
