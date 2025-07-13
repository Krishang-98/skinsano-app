"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { isSupabaseConfigured } from "@/lib/supabase"
import { DatabaseService } from "@/lib/database"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Camera,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Shield,
  FileText,
  Lightbulb,
  Video,
  LogOut,
  User,
  BarChart3,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react"

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [consultations, setConsultations] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [scanLimit, setScanLimit] = useState({ canScan: true, usedScans: 0 })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Loading dashboard data for user:", user.id)

      // Check scan limits first
      const { canScan, usedScans } = await DatabaseService.checkUserScanLimit(user.id, user.is_premium)
      setScanLimit({ canScan, usedScans })
      console.log("Scan limits:", { canScan, usedScans })

      // Load user's analyses with retry logic
      let userAnalyses = []
      try {
        const { data: analysesData, error: analysesError } = await DatabaseService.getUserAnalyses(user.id)

        if (analysesError) {
          console.warn("Failed to load analyses from database:", analysesError)
        }

        userAnalyses = analysesData || []
        console.log("Loaded analyses:", userAnalyses.length)

        // Also check localStorage for any local analyses
        const localAnalyses = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith("analysis-")) {
            try {
              const localData = localStorage.getItem(key)
              if (localData) {
                const analysis = JSON.parse(localData)
                if (analysis.user_id === user.id) {
                  localAnalyses.push(analysis)
                }
              }
            } catch (parseError) {
              console.warn("Failed to parse local analysis:", parseError)
            }
          }
        }

        // Combine and deduplicate analyses
        const allAnalyses = [...userAnalyses, ...localAnalyses]
        const uniqueAnalyses = allAnalyses.filter(
          (analysis, index, self) => index === self.findIndex((a) => a.id === analysis.id),
        )

        // Sort by creation date (newest first)
        uniqueAnalyses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setAnalyses(uniqueAnalyses)
        console.log("Final analyses count:", uniqueAnalyses.length)
      } catch (analysisError) {
        console.error("Error loading analyses:", analysisError)
        setAnalyses([])
      }

      // Load consultations (mock for now)
      setConsultations([])
    } catch (error) {
      console.error("Dashboard loading error:", error)
      setError("Failed to load dashboard data")
      setAnalyses([])
      setConsultations([])
    } finally {
      setLoading(false)
    }
  }

  const refreshDashboard = async () => {
    await loadDashboardData()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading dashboard...</h2>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        {/* Demo Mode Indicator */}
        {!isSupabaseConfigured() && (
          <div className="bg-yellow-500/20 border-b border-yellow-500/30 p-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-200">
                    <span className="font-medium">Demo Mode:</span> Using sample data. Configure Supabase for full
                    functionality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scan Limit Warning */}
        {!user?.is_premium && !scanLimit.canScan && (
          <div className="bg-orange-500/20 border-b border-orange-500/30 p-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-orange-400 mr-2" />
                  <p className="text-sm text-orange-200">
                    <span className="font-medium">Scan Limit Reached:</span> You've used {scanLimit.usedScans}/1 free
                    scans this month.
                    <Link href="/pricing" className="underline ml-1">
                      Upgrade to Premium
                    </Link>{" "}
                    for unlimited scans.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/20 border-b border-red-500/30 p-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-200">
                    <span className="font-medium">Error:</span> {error}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">SkinSano</span>
                </Link>
                {!isSupabaseConfigured() && (
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Demo Mode
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshDashboard}
                  className="text-gray-400 hover:text-white"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{user?.name || "Demo User"}</span>
                  {user?.is_premium && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Premium</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-400 hover:text-white">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || "Demo User"}!</h1>
            <p className="text-gray-400">Track your skin health journey and manage your care.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href={scanLimit.canScan || user?.is_premium ? "/analysis" : "/pricing"}>
              <Card
                className={`bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30 hover:border-green-400 transition-all cursor-pointer group ${!scanLimit.canScan && !user?.is_premium ? "opacity-60" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Camera className="h-6 w-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white">
                        {scanLimit.canScan || user?.is_premium ? "New Skin Analysis" : "Upgrade for More Scans"}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {scanLimit.canScan || user?.is_premium
                          ? "Get instant AI-powered skin analysis"
                          : `Used ${scanLimit.usedScans}/1 free scans`}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-green-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/consultation">
              <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Calendar className="h-6 w-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white">Book Consultation</h3>
                      <p className="text-gray-300 text-sm">Schedule with a dermatologist</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Stats Grid - Removed Health Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Analyses</p>
                    <p className="text-2xl font-bold text-white">{analyses.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-white">
                      {analyses.filter((a) => a.status === "completed").length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Scans Remaining</p>
                    <p className="text-2xl font-bold text-white">
                      {user?.is_premium ? "∞" : Math.max(0, 1 - scanLimit.usedScans)}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Analyses */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 text-green-400 mr-2" />
                      Recent Analyses
                    </CardTitle>
                    <Link href={scanLimit.canScan || user?.is_premium ? "/analysis" : "/pricing"}>
                      <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                        {scanLimit.canScan || user?.is_premium ? "New Analysis" : "Upgrade"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <CardDescription>Your latest skin analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyses.length > 0 ? (
                    <div className="space-y-4">
                      {analyses.slice(0, 3).map((analysis) => (
                        <Link href={`/results?id=${analysis.id}`} key={analysis.id}>
                          <Card className="bg-gray-800/50 border-gray-600 hover:border-green-500/50 transition-all cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={analysis.image_urls?.[0] || "/placeholder.svg?height=64&width=64&query=skin"}
                                    alt="Analysis"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-white truncate">{analysis.condition}</h4>
                                    <Badge
                                      className={
                                        analysis.severity === "Mild"
                                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                          : analysis.severity === "Moderate"
                                            ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                            : "bg-red-500/20 text-red-400 border-red-500/30"
                                      }
                                    >
                                      {analysis.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-400 mb-2 truncate">{analysis.description}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatDate(analysis.created_at)}
                                    </div>
                                    <div className="text-xs text-green-400">
                                      {Math.round((analysis.confidence || 0.5) * 100)}% confidence
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No analyses yet</h3>
                      <p className="text-gray-400 mb-4">Start your skin health journey with your first analysis</p>
                      <Link href={scanLimit.canScan || user?.is_premium ? "/analysis" : "/pricing"}>
                        <Button className="bg-green-500 hover:bg-green-600">
                          <Camera className="h-4 w-4 mr-2" />
                          {scanLimit.canScan || user?.is_premium ? "Start Analysis" : "Upgrade Plan"}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Consultations */}
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-400 mr-2" />
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {consultations.length > 0 ? (
                    <div className="space-y-3">
                      {consultations.map((consultation) => (
                        <div key={consultation.id} className="p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white text-sm">{consultation.doctor_name}</h4>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              {consultation.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            {formatDate(consultation.scheduled_date)} at {consultation.scheduled_time}
                          </div>
                          <a href={consultation.meeting_url} target="_blank" rel="noopener noreferrer">
                            <Button
                              size="sm"
                              className="w-full bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                            >
                              <Video className="h-3 w-3 mr-1" />
                              Join Call
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Calendar className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-3">No upcoming consultations</p>
                      <Link href="/consultation">
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 text-green-400 mr-2" />
                    Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Plan</span>
                      <Badge
                        className={
                          user?.is_premium
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }
                      >
                        {user?.is_premium ? "Premium" : "Free"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Analyses</span>
                      <span className="text-sm text-white">
                        {user?.is_premium ? "Unlimited" : `${scanLimit.usedScans}/1 used`}
                      </span>
                    </div>
                    {!user?.is_premium && (
                      <Link href="/pricing">
                        <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 mt-3">
                          Upgrade Plan
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Tip */}
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 text-yellow-400 mr-2" />
                    Daily Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <h4 className="font-medium text-yellow-400 mb-1 text-sm">Stay Hydrated</h4>
                    <p className="text-xs text-yellow-200/80">
                      Drink 8 glasses of water daily for healthy, glowing skin.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
