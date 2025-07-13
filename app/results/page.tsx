"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Clock,
  Target,
  TrendingUp,
  Camera,
  FileText,
  Heart,
  Award,
  Eye,
  Sparkles,
  Microscope,
  Activity,
  Brain,
  Cpu,
} from "lucide-react"

interface SkinAnalysis {
  id: string
  user_id: string
  condition: string
  confidence: number
  severity: string
  description: string
  recommendations: string[]
  risk_factors: string[]
  image_urls: string[]
  symptoms: string
  analysis_type: string
  status: string
  visual_findings?: Array<{
    finding: string
    location: string
    severity: string
    description: string
  }>
  treatment_plan?: {
    phase: number
    title: string
    duration: string
    treatments: string[]
    expected_improvement: string
  }
  created_at: string
  updated_at: string
}

export default function ResultsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const analysisId = searchParams?.get("id")
  const isLocal = searchParams?.get("local") === "true"

  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalysis()
  }, [analysisId, isLocal])

  const loadAnalysis = async () => {
    if (!analysisId) {
      setError("No analysis ID provided")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Check if this is a local analysis first
      if (isLocal) {
        const localData = localStorage.getItem(`analysis-${analysisId}`)
        if (localData) {
          try {
            const localAnalysis = JSON.parse(localData)
            setAnalysis(localAnalysis)
            setLoading(false)
            return
          } catch (parseError) {
            console.warn("Failed to parse local analysis:", parseError)
          }
        }
      }

      // Try to fetch from API
      try {
        const response = await fetch(`/api/analysis/${analysisId}`)

        if (response.ok) {
          const data = await response.json()
          if (data.analysis) {
            setAnalysis(data.analysis)
            setLoading(false)
            return
          }
        }
      } catch (fetchError) {
        console.warn("API fetch failed:", fetchError)
      }

      // If no analysis found, show error
      setError("Analysis not found. Please try creating a new analysis.")
    } catch (error) {
      console.error("Error loading analysis:", error)
      setError("Failed to load analysis results")
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity?: string) => {
    if (!severity) return "bg-gradient-to-r from-gray-500 to-gray-600 text-white"

    switch (severity.toLowerCase()) {
      case "mild":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "moderate":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "severe":
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white"
      default:
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Recently"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin">
              <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">AI Analyzing Your Image</h2>
          <p className="text-gray-400 text-lg">Processing with advanced computer vision...</p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Cpu className="h-4 w-4" />
            <span>GPT-4 Vision • Medical Analysis • Pattern Recognition</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">Analysis Not Available</h2>
          <p className="text-gray-400 mb-8 text-lg">{error || "The requested analysis could not be found."}</p>
          <div className="space-y-4">
            <Link href="/analysis">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 w-full">
                <Camera className="h-5 w-5 mr-2" />
                Start New Analysis
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check if this is an error analysis (no OpenAI key or analysis failed)
  const isErrorAnalysis =
    analysis.condition === "Analysis Unavailable" ||
    analysis.condition === "AI Analysis Failed" ||
    analysis.condition === "Parsing Error" ||
    analysis.confidence === 0

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Premium Header */}
        <nav className="relative z-10 border-b border-gray-800/50 bg-black/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/dashboard" className="flex items-center space-x-4 group">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">SkinSano</div>
                  <div className="text-xs text-gray-400">AI Vision Analysis</div>
                </div>
              </Link>
              <div className="flex items-center space-x-4">
                {isErrorAnalysis ? (
                  <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white border-none px-4 py-2">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Analysis Failed
                  </Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none px-4 py-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    AI Analysis Complete
                  </Badge>
                )}
                <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-none px-4 py-2">
                  <Brain className="w-4 h-4 mr-2" />
                  GPT-4 Vision
                </Badge>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div
              className={`inline-flex items-center justify-center p-3 rounded-2xl mb-6 border ${
                isErrorAnalysis
                  ? "bg-gradient-to-r from-red-600/20 to-rose-600/20 border-red-500/20"
                  : "bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/20"
              }`}
            >
              {isErrorAnalysis ? (
                <AlertTriangle className="h-8 w-8 text-red-400" />
              ) : (
                <Award className="h-8 w-8 text-green-400" />
              )}
            </div>
            <h1
              className={`text-5xl font-bold text-white mb-4 bg-gradient-to-r bg-clip-text text-transparent ${
                isErrorAnalysis ? "from-red-400 via-rose-400 to-red-400" : "from-green-400 via-emerald-400 to-green-400"
              }`}
            >
              {isErrorAnalysis ? "Analysis Unavailable" : "AI Vision Analysis Complete"}
            </h1>
            <div className="flex items-center justify-center space-x-6 text-gray-300">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>{formatDate(analysis.created_at)}</span>
              </div>
              {!isErrorAnalysis && (
                <div className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  <span>Confidence: {Math.round(analysis.confidence || 0)}%</span>
                </div>
              )}
              <div className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                <span>ID: {analysis.id.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {isErrorAnalysis ? (
            // Error State
            <div className="max-w-4xl mx-auto">
              <Card className="bg-black/60 border-red-800/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="border-b border-red-800/50">
                  <CardTitle className="text-white text-2xl flex items-center">
                    <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
                    {analysis.condition}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="text-gray-300 text-lg leading-relaxed">
                    <p>{analysis.description}</p>
                  </div>

                  <div className="bg-gradient-to-r from-red-900/20 to-rose-900/20 border border-red-500/30 rounded-2xl p-6">
                    <h4 className="text-red-400 font-semibold text-lg mb-4">Required Actions:</h4>
                    <div className="space-y-3">
                      {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-gray-300">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 pt-6">
                    <Link href="/analysis">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3">
                        <Camera className="h-5 w-5 mr-2" />
                        Try New Analysis
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline" className="px-8 py-3">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Success State - Real AI Analysis Results
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Results */}
              <div className="xl:col-span-3 space-y-8">
                {/* Primary Diagnosis */}
                <Card className="bg-black/60 border-gray-800/50 backdrop-blur-xl shadow-2xl">
                  <CardHeader className="border-b border-gray-800/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-2xl flex items-center">
                        <Microscope className="h-6 w-6 text-purple-400 mr-3" />
                        AI Vision Diagnosis
                      </CardTitle>
                      <Badge className={getSeverityColor(analysis.severity)} variant="outline">
                        {analysis.severity} Severity
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-4">{analysis.condition}</h3>
                      <div className="text-gray-300 text-lg leading-relaxed space-y-4">
                        <p>{analysis.description}</p>
                        {analysis.symptoms && (
                          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                            <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Additional Context:
                            </h4>
                            <p className="text-blue-200">{analysis.symptoms}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6">
                      <div className="flex items-center mb-4">
                        <Brain className="h-6 w-6 text-purple-400 mr-3" />
                        <span className="font-semibold text-purple-400 text-lg">AI Vision Confidence</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <Progress value={analysis.confidence || 0} className="h-3 bg-gray-800" />
                        </div>
                        <span className="text-white font-bold text-xl">{Math.round(analysis.confidence || 0)}%</span>
                      </div>
                      <p className="text-purple-200/80 text-sm mt-2">
                        Based on GPT-4 Vision analysis of your uploaded image
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Findings */}
                {analysis.visual_findings && analysis.visual_findings.length > 0 && (
                  <Card className="bg-black/60 border-gray-800/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="border-b border-gray-800/50">
                      <CardTitle className="text-white text-2xl flex items-center">
                        <Eye className="h-6 w-6 text-blue-400 mr-3" />
                        Clinical Findings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid gap-6">
                        {analysis.visual_findings.map((finding, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-6"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-white font-semibold text-lg">{finding.finding}</h4>
                              <Badge className={getSeverityColor(finding.severity)} variant="outline">
                                {finding.severity || "Detected"}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-300">
                                <span className="font-medium mr-2">Location:</span>
                                <span>{finding.location}</span>
                              </div>
                              <p className="text-gray-400 leading-relaxed">{finding.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Treatment Plan */}
                {analysis.treatment_plan && (
                  <Card className="bg-black/60 border-gray-800/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="border-b border-gray-800/50">
                      <CardTitle className="text-white text-2xl flex items-center">
                        <Heart className="h-6 w-6 text-red-400 mr-3" />
                        Treatment Protocol
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold text-xl">{analysis.treatment_plan.title}</h4>
                          <Badge className="bg-green-600 text-white">Phase {analysis.treatment_plan.phase}</Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center text-gray-300">
                            <Clock className="h-5 w-5 text-green-400 mr-2" />
                            <span className="font-medium">Duration: {analysis.treatment_plan.duration}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                            <span className="font-medium">
                              Expected: {analysis.treatment_plan.expected_improvement}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-white font-medium mb-3">Treatment Steps:</h5>
                          <div className="space-y-2">
                            {(analysis.treatment_plan.treatments || []).map((treatment, index) => (
                              <div key={index} className="flex items-start">
                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                  <span className="text-white text-xs font-bold">{index + 1}</span>
                                </div>
                                <span className="text-gray-300">{treatment}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card className="bg-black/60 border-gray-800/50 backdrop-blur-xl shadow-2xl">
                  <CardHeader className="border-b border-gray-800/50">
                    <CardTitle className="text-white text-2xl flex items-center">
                      <Lightbulb className="h-6 w-6 text-yellow-400 mr-3" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      {(analysis.recommendations || []).map((recommendation, index) => (
                        <div
                          key={index}
                          className="flex items-start p-4 bg-gradient-to-r from-yellow-900/10 to-orange-900/10 border border-yellow-500/20 rounded-xl"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                            <span className="text-black text-sm font-bold">{index + 1}</span>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card className="bg-black/60 border-gray-800/50 backdrop-blur-xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center">
                      <Activity className="h-5 w-5 text-purple-400 mr-2" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Condition</span>
                      <span className="text-white font-medium text-sm">{analysis.condition}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Severity</span>
                      <Badge className={getSeverityColor(analysis.severity)} variant="outline">
                        {analysis.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Confidence</span>
                      <span className="text-white font-medium">{Math.round(analysis.confidence || 0)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">AI Model</span>
                      <Badge className="bg-blue-600 text-white">GPT-4 Vision</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Factors */}
                <Card className="bg-black/60 border-gray-800/50 backdrop-blur-xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center">
                      <AlertTriangle className="h-5 w-5 text-orange-400 mr-2" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(analysis.risk_factors || []).map((factor, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                          <span className="text-gray-300 text-sm">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Action Center */}
          <div className="mt-16">
            <Card className="bg-black/60 border-gray-800/50 backdrop-blur-xl shadow-2xl">
              <CardHeader className="text-center border-b border-gray-800/50">
                <CardTitle className="text-white text-2xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-purple-400 mr-3" />
                  Next Steps
                </CardTitle>
                <CardDescription className="text-gray-400 text-lg">
                  Continue your skin health journey with professional care
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <Link href="/consultation" className="group">
                    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 text-center hover:border-purple-400/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/10">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">Book Consultation</h3>
                      <p className="text-gray-400 text-sm">Get personalized treatment from certified dermatologists</p>
                    </div>
                  </Link>

                  <Link href="/analysis" className="group">
                    <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl p-6 text-center hover:border-blue-400/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">New Analysis</h3>
                      <p className="text-gray-400 text-sm">Analyze different areas or track progress</p>
                    </div>
                  </Link>

                  <Link href="/dashboard" className="group">
                    <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6 text-center hover:border-green-400/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/10">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <ArrowLeft className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">Back to Dashboard</h3>
                      <p className="text-gray-400 text-sm">View all your analyses and health insights</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
