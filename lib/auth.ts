import type { User } from "./supabase"

export async function signUp(email: string, password: string, name: string, profile?: any) {
  try {
    console.log("Mock sign up:", { email, name })

    // Always return that verification is needed for realistic flow
    return {
      success: true,
      needsVerification: true,
      data: {
        user: { id: "mock-user-id", email, name },
        session: null,
      },
    }
  } catch (error: any) {
    console.error("Sign up error:", error)
    return { success: false, error: error?.message || "Sign up failed" }
  }
}

export async function signIn(email: string, password: string) {
  try {
    // For now, return mock data since Supabase isn't configured yet
    console.log("Mock sign in:", { email })
    return {
      success: true,
      data: {
        user: { id: "mock-user-id", email },
        session: { access_token: "mock-token" },
      },
    }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return { success: false, error: error?.message || "Sign in failed" }
  }
}

export async function signOut() {
  try {
    console.log("Mock sign out")
    return { success: true }
  } catch (error: any) {
    console.error("Sign out error:", error)
    return { success: false, error: error?.message || "Sign out failed" }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Return mock user for now
    return {
      id: "mock-user-id",
      email: "user@example.com",
      name: "Mock User",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  try {
    console.log("Mock update profile:", { userId, updates })
    return { success: true, data: updates }
  } catch (error: any) {
    console.error("Update profile error:", error)
    return { success: false, error: error?.message || "Update failed" }
  }
}
