import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const { success, error } = await DatabaseService.testConnection()

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: error?.message || "Unknown error",
        },
        { status: 500 },
      )
    }

    // Get basic stats
    const { data: users } = await DatabaseService.getAllUsers(10)
    const { data: analyses } = await DatabaseService.getAllAnalyses(10)

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      stats: {
        totalUsers: users?.length || 0,
        totalAnalyses: analyses?.length || 0,
        powerUsers: users?.filter((u) => u.role === "power_user").length || 0,
        premiumUsers: users?.filter((u) => u.is_premium).length || 0,
      },
      powerUser: users?.find((u) => u.email === "aekukrishang@gmail.com") || null,
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
