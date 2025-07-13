"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase, isSupabaseConfigured } from "./supabase"
import { DatabaseService } from "./database"

interface User {
  id: string
  email: string
  name?: string
  is_premium?: boolean
  subscription_status?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  signUp: (email: string, password: string, name: string, profile?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  isDemo: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if Supabase is configured
        const supabaseConfigured = isSupabaseConfigured()

        if (!supabaseConfigured || !supabase) {
          console.log("Supabase not configured - running in demo mode")
          setIsDemo(true)
          setLoading(false)
          return
        }

        console.log("Supabase configured - initializing auth")
        setIsDemo(false)

        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.warn("Error getting session, using demo mode:", error.message || "Unknown error")
          setIsDemo(true)
          setLoading(false)
          return
        }

        if (session?.user) {
          await handleUserSession(session.user, session.access_token)
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event)

          if (session?.user) {
            await handleUserSession(session.user, session.access_token)
          } else {
            setUser(null)
            setToken(null)
          }
        })

        setLoading(false)
        return () => subscription.unsubscribe()
      } catch (error: any) {
        console.warn("Auth initialization error, using demo mode:", error.message || "Unknown error")
        setIsDemo(true)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const handleUserSession = async (authUser: any, accessToken: string) => {
    try {
      setToken(accessToken)

      // Get user profile from database
      let userProfile = null
      try {
        userProfile = await DatabaseService.getUser(authUser.id)
      } catch (error: any) {
        console.warn("Could not fetch user profile:", error.message || "Unknown error")
      }

      if (!userProfile) {
        // Try to create user profile
        try {
          userProfile = await DatabaseService.createUser({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
          })
        } catch (error: any) {
          console.warn("Could not create user profile:", error.message || "Unknown error")
        }
      }

      const user: User = {
        id: authUser.id,
        email: authUser.email,
        name: userProfile?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
        is_premium: userProfile?.is_premium || authUser.email === "aekukrishang@gmail.com",
        subscription_status: userProfile?.subscription_status || "free",
        role: userProfile?.role || (authUser.email === "aekukrishang@gmail.com" ? "admin" : "user"),
      }

      setUser(user)
    } catch (error: any) {
      console.warn("Error handling user session:", error.message || "Unknown error")

      // Fallback user object
      const fallbackUser: User = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
        is_premium: authUser.email === "aekukrishang@gmail.com",
        subscription_status: "free",
        role: authUser.email === "aekukrishang@gmail.com" ? "admin" : "user",
      }

      setUser(fallbackUser)
    }
  }

  const signUp = async (email: string, password: string, name: string, profile?: any) => {
    try {
      if (isDemo || !isSupabaseConfigured() || !supabase) {
        // Demo mode - create demo user
        const demoUser: User = {
          id: `demo-${Date.now()}`,
          email,
          name,
          is_premium: email === "aekukrishang@gmail.com",
          subscription_status: "free",
          role: email === "aekukrishang@gmail.com" ? "admin" : "user",
        }

        setUser(demoUser)
        setToken(`demo-token-${demoUser.id}`)

        return {
          success: true,
          message: "Account created successfully! (Demo Mode)",
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            ...profile,
          },
        },
      })

      if (error) {
        console.warn("Sign up error:", error.message || "Unknown error")
        return {
          success: false,
          error: error.message || "Sign up failed",
        }
      }

      return {
        success: true,
        needsVerification: !data.session,
        message: data.session ? "Account created successfully!" : "Please check your email to verify your account.",
        data,
      }
    } catch (error: any) {
      console.warn("Sign up error:", error.message || "Unknown error")
      return {
        success: false,
        error: error?.message || "Sign up failed",
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (isDemo || !isSupabaseConfigured() || !supabase) {
        // Demo mode - create demo user
        const demoUser: User = {
          id: `demo-${Date.now()}`,
          email,
          name: email.split("@")[0],
          is_premium: email === "aekukrishang@gmail.com",
          subscription_status: "free",
          role: email === "aekukrishang@gmail.com" ? "admin" : "user",
        }

        setUser(demoUser)
        setToken(`demo-token-${demoUser.id}`)

        return {
          success: true,
          message: "Signed in successfully! (Demo Mode)",
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.warn("Sign in error:", error.message || "Unknown error")
        return {
          success: false,
          error: error.message || "Invalid credentials",
        }
      }

      return {
        success: true,
        message: "Signed in successfully!",
        data,
      }
    } catch (error: any) {
      console.warn("Sign in error:", error.message || "Unknown error")
      return {
        success: false,
        error: error?.message || "Sign in failed",
      }
    }
  }

  const signOut = async () => {
    try {
      if (!isDemo && isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.warn("Sign out error:", error.message || "Unknown error")
        }
      }

      setUser(null)
      setToken(null)
    } catch (error: any) {
      console.warn("Sign out error:", error.message || "Unknown error")
    }
  }

  const refreshUser = async () => {
    if (!user) return

    try {
      if (!isDemo && isSupabaseConfigured()) {
        const userProfile = await DatabaseService.getUser(user.id)
        if (userProfile) {
          setUser({
            ...user,
            is_premium: userProfile.is_premium,
            subscription_status: userProfile.subscription_status,
            role: userProfile.role,
          })
        }
      }
    } catch (error: any) {
      console.warn("Error refreshing user:", error.message || "Unknown error")
    }
  }

  const value = {
    user,
    token,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
    isDemo,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
