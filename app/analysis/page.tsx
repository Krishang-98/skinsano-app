"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, AlertCircle, Loader2, CheckCircle, Upload, X, FileText, Zap, ArrowLeft, Brain } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"

export default function AnalysisPage() {
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [symptoms, setSymptoms] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useAuth()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/")
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      setError("Some files were skipped. Please upload only image files under 10MB.")
      setTimeout(() => setError(null), 5000)
    }

    const currentCount = images.length
    const availableSlots = 3 - currentCount
    const selectedFiles = validFiles.slice(0, availableSlots)

    if (selectedFiles.length > 0) {
      const newImages = [...images, ...selectedFiles]
      const newUrls = selectedFiles.map((file) => URL.createObjectURL(file))
      const allUrls = [...imageUrls, ...newUrls]

      setImages(newImages)
      setImageUrls(allUrls)
      setSuccess(`${selectedFiles.length} image(s) uploaded successfully`)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    handleFiles(files)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newUrls = imageUrls.filter((_, i) => i !== index)
    URL.revokeObjectURL(imageUrls[index])
    setImages(newImages)
    setImageUrls(newUrls)
  }

  const validateInput = () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms in detail")
      return false
    }

    if (symptoms.trim().length < 20) {
      setError("Please provide a more detailed description (at least 20 characters)")
      return false
    }

    return true
  }

  const handleAnalysis = async () => {
    if (!validateInput()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Starting AI analysis...")

      // Determine analysis type based on user subscription
      const analysisType = user?.is_premium ? "premium" : "free"

      const requestBody = {
        symptoms: symptoms.trim(),
        analysisType,
        userId: user?.id || `guest-${Date.now()}`,
        imageCount: images.length,
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      if (!data.success || !data.data) {
        throw new Error(data.error || "Analysis failed")
      }

      console.log("AI analysis completed successfully:", data.data.id)

      localStorage.setItem(`analysis-${data.data.id}`, JSON.stringify(data.data))
      imageUrls.forEach((url) => URL.revokeObjectURL(url))

      setSuccess("Analysis completed! Redirecting to results...")

      setTimeout(() => {
        router.push(`/results?id=${data.data.id}&local=true`)
      }, 1500)
    } catch (error: any) {
      console.error("Analysis error:", error)
      setError(error.message || "Analysis failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </Link>
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">SkinSano</h1>
                  <p className="text-sm text-gray-400">AI Skin Analysis</p>
                </div>
              </div>
              {user?.is_premium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">Premium</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">AI Skin Analysis</h2>
            <p className="text-lg text-gray-300">
              Upload images and describe your symptoms to get instant AI-powered analysis
            </p>
          </div>

          {/* Image Upload */}
          <Card className="mb-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Upload className="h-5 w-5 text-green-400" />
                Upload Images
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  Optional
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Upload up to 3 clear images of the affected area for enhanced analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? "border-green-400 bg-green-500/10 scale-105"
                    : "border-gray-600 hover:border-green-400 hover:bg-green-500/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Camera className="h-8 w-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white mb-2">
                      {dragActive ? "Drop images here" : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-sm text-gray-400">JPG, PNG files up to 10MB each • Maximum 3 images</p>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              {imageUrls.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-white">Uploaded Images</h4>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {imageUrls.length}/3 images
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="relative overflow-hidden rounded-xl border-2 border-gray-600 group-hover:border-green-400 transition-all duration-200">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(index)
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Symptoms */}
          <Card className="mb-6 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-blue-400" />
                Describe Your Symptoms
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Required</Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Provide detailed information about your skin condition, symptoms, and duration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Example: I have red, itchy patches on my arms that appeared 3 days ago. The skin feels dry and slightly raised. It gets worse at night and seems to be spreading. The affected area is warm to touch and about 2-3 cm in diameter..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="min-h-[140px] bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-400"
              />
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className={`font-medium ${symptoms.length < 20 ? "text-red-400" : "text-green-400"}`}>
                  {symptoms.length}/1000 characters
                </span>
                <span className="text-gray-500">Minimum 20 characters required</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Messages */}
          {success && (
            <Card className="mb-6 border-green-500/50 bg-green-500/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">{success}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="mb-6 border-red-500/50 bg-red-500/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{error}</p>
                    <p className="text-sm mt-1 text-red-300">Please check your input and try again.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Button */}
          <div className="text-center">
            <Button
              onClick={handleAnalysis}
              disabled={loading || !symptoms.trim() || symptoms.trim().length < 20}
              size="lg"
              className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Brain className="h-6 w-6 mr-3" />
                  Start AI Analysis
                </>
              )}
            </Button>

            {!user?.is_premium && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400 mb-2">
                  Free users: {/* This would show remaining scans */} scans remaining this month
                </p>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    Upgrade for Unlimited Analysis
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-2 bg-yellow-500/20 rounded-full mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="font-semibold text-yellow-400 mb-2">Medical Disclaimer</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                This AI analysis is for informational purposes only and should not replace professional medical advice.
                Always consult with a qualified healthcare provider for proper diagnosis and treatment. In case of
                emergency, contact your local emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
