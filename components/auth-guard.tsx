"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && requireAuth && !user && mounted) {
      router.push("/auth/sign-in")
    }
  }, [user, loading, requireAuth, router, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin">
              <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Loading</h2>
          <p className="text-gray-400 text-lg">Initializing application...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin">
              <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Loading</h2>
          <p className="text-gray-400 text-lg">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null // Will redirect
  }

  return <>{children}</>
}
