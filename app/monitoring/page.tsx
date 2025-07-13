"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthGuard } from "@/components/auth-guard"
import { Logo } from "@/components/logo"
import {
  TrendingUp,
  TrendingDown,
  CalendarIcon,
  Camera,
  Plus,
  Save,
  ArrowLeft,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  LineChart,
  Award,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

interface ProgressEntry {
  id: string
  date: string
  symptoms_rating: number
  improvement_score: number
  notes: string
  photos: string[]
}

export default function MonitoringPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [symptomsRating, setSymptomsRating] = useState(5)
  const [notes, setNotes] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [progressData, setProgressData] = useState<ProgressEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load progress data on component mount
  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data with realistic progression
      const mockData: ProgressEntry[] = [
        {
          id: "1",
          date: "2024-01-20",
          symptoms_rating: 3,
          improvement_score: 85,
          notes:
            "Significant improvement! Redness has reduced dramatically. Skin feels much smoother and less irritated.",
          photos: ["/placeholder.svg?height=100&width=100&text=Progress+Photo+1"],
        },
        {
          id: "2",
          date: "2024-01-15",
          symptoms_rating: 4,
          improvement_score: 70,
          notes: "Good progress this week. The new moisturizer is working well. Less dryness and flaking.",
          photos: ["/placeholder.svg?height=100&width=100&text=Progress+Photo+2"],
        },
        {
          id: "3",
          date: "2024-01-10",
          symptoms_rating: 6,
          improvement_score: 50,
          notes:
            "Some improvement visible. Continuing with the prescribed treatment. Slight reduction in inflammation.",
          photos: ["/placeholder.svg?height=100&width=100&text=Progress+Photo+3"],
        },
        {
          id: "4",
          date: "2024-01-05",
          symptoms_rating: 8,
          improvement_score: 25,
          notes: "Started new treatment plan. Initial application went well, no adverse reactions noted.",
          photos: ["/placeholder.svg?height=100&width=100&text=Progress+Photo+4"],
        },
        {
          id: "5",
          date: "2024-01-01",
          symptoms_rating: 9,
          improvement_score: 0,
          notes: "Baseline photos and assessment. Beginning treatment journey with high hopes.",
          photos: ["/placeholder.svg?height=100&width=100&text=Initial+Assessment"],
        },
      ]

      setProgressData(mockData)
    } catch (error) {
      console.error("Error loading progress data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotos((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveEntry = async () => {
    if (!selectedDate) return

    setIsSaving(true)
    try {
      const improvementScore = calculateImprovementScore()

      const newEntry: ProgressEntry = {
        id: `entry-${Date.now()}`,
        date: selectedDate.toISOString().split("T")[0],
        symptoms_rating: symptomsRating,
        improvement_score: improvementScore,
        notes,
        photos: [...photos],
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Add to local state
      setProgressData((prev) => [newEntry, ...prev])

      // Reset form
      setNotes("")
      setPhotos([])
      setSymptomsRating(5)
      setSelectedDate(new Date())

      // Show success message
      alert("Progress entry saved successfully!")
    } catch (error) {
      console.error("Error saving progress:", error)
      alert("Failed to save progress entry. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const calculateImprovementScore = () => {
    const baseline = 9 // Starting symptoms rating
    const improvement = ((baseline - symptomsRating) / baseline) * 100
    return Math.max(0, Math.min(100, Math.round(improvement)))
  }

  const getProgressTrend = () => {
    if (progressData.length < 2) return { trend: "stable", change: 0 }

    const latest = progressData[0]?.improvement_score || 0
    const previous = progressData[1]?.improvement_score || 0
    const change = latest - previous

    return {
      trend: change > 5 ? "improving" : change < -5 ? "declining" : "stable",
      change: Math.abs(change),
    }
  }

  const overallProgress = progressData.length > 0 ? progressData[0]?.improvement_score || 0 : 0
  const progressTrend = getProgressTrend()
  const currentSymptoms = progressData.length > 0 ? progressData[0]?.symptoms_rating || 0 : 0

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/dashboard">
                <Logo size="md" />
              </Link>
              <div className="flex items-center space-x-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Progress Tracking
                </Badge>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Progress Monitoring</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track your skin health journey with detailed progress monitoring and insights
            </p>
          </div>

          {/* Progress Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Overall Progress</CardTitle>
                  <Target className="w-6 h-6 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-green-400">{overallProgress}%</span>
                    <div
                      className={`flex items-center space-x-1 ${
                        progressTrend.trend === "improving"
                          ? "text-green-400"
                          : progressTrend.trend === "declining"
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {progressTrend.trend === "improving" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : progressTrend.trend === "declining" ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <LineChart className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {progressTrend.change > 0 ? `+${progressTrend.change}%` : "Stable"}
                      </span>
                    </div>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                  <p className="text-gray-300 text-sm">
                    {progressTrend.trend === "improving"
                      ? "Excellent progress! Keep up the great work."
                      : progressTrend.trend === "declining"
                        ? "Consider consulting your dermatologist."
                        : "Maintaining steady progress."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Days Tracked</CardTitle>
                  <CalendarIcon className="w-6 h-6 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <span className="text-3xl font-bold text-blue-400">{progressData.length}</span>
                  <p className="text-gray-300 text-sm">
                    Consistent tracking helps identify patterns and improvements over time
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Current Symptoms</CardTitle>
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <span className="text-3xl font-bold text-yellow-400">{currentSymptoms}/10</span>
                  <p className="text-gray-300 text-sm">
                    {currentSymptoms <= 3
                      ? "Mild symptoms - great improvement!"
                      : currentSymptoms <= 6
                        ? "Moderate symptoms - steady progress"
                        : "Significant symptoms - continue treatment"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="add-entry" className="space-y-6">
            <TabsList className="bg-gray-900 border border-gray-800">
              <TabsTrigger
                value="add-entry"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-black"
              >
                Add Entry
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                Progress History
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                Insights & Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add-entry">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Entry Form */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl">New Progress Entry</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Date Selection */}
                    <div>
                      <Label className="text-lg font-medium mb-3 block">Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border border-gray-700 bg-gray-800"
                        disabled={(date) => date > new Date()}
                      />
                    </div>

                    {/* Symptoms Rating */}
                    <div>
                      <Label className="text-lg font-medium mb-3 block">
                        Symptoms Severity (1 = Minimal, 10 = Severe)
                      </Label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Minimal</span>
                          <span className="text-2xl font-bold text-white">{symptomsRating}</span>
                          <span className="text-sm text-gray-400">Severe</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={symptomsRating}
                          onChange={(e) => setSymptomsRating(Number(e.target.value))}
                          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #10b981 0%, #10b981 ${(symptomsRating - 1) * 11.11}%, #374151 ${(symptomsRating - 1) * 11.11}%, #374151 100%)`,
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <span key={num}>{num}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes" className="text-lg font-medium mb-3 block">
                        Notes & Observations
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Describe any changes, reactions, treatments used, or other observations..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-32 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                      />
                      <div className="text-sm text-gray-400 mt-1">{notes.length}/500 characters</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Upload */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl">Progress Photos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {photos.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">Upload Progress Photos</p>
                        <p className="text-sm text-gray-400 mb-4">
                          Take photos in consistent lighting for best comparison
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <Label htmlFor="photo-upload">
                          <Button className="bg-green-500 hover:bg-green-600 cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Photos
                          </Button>
                        </Label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={photo || "/placeholder.svg"}
                                alt={`Progress photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-600 group-hover:border-green-500 transition-colors"
                              />
                              <button
                                onClick={() => removePhoto(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload-more"
                        />
                        <Label htmlFor="photo-upload-more">
                          <Button
                            variant="outline"
                            className="w-full border-gray-600 hover:border-green-500 cursor-pointer"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add More Photos
                          </Button>
                        </Label>
                      </div>
                    )}

                    {/* Photography Tips */}
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-green-400 mb-2">📸 Photography Tips</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Use consistent lighting (natural light preferred)</li>
                        <li>• Take photos from the same angle and distance</li>
                        <li>• Avoid filters or editing</li>
                        <li>• Include a reference object for scale if helpful</li>
                      </ul>
                    </div>

                    {/* Save Button */}
                    <Button
                      onClick={handleSaveEntry}
                      disabled={isSaving || !selectedDate}
                      className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 py-6 text-lg font-semibold"
                    >
                      {isSaving ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving Entry...
                        </div>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Save Progress Entry
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading progress history...</p>
                  </div>
                ) : progressData.length > 0 ? (
                  progressData.map((entry, index) => (
                    <Card key={entry.id} className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold">
                                {new Date(entry.date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </h3>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Day {progressData.length - index}
                              </Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <Label className="text-gray-400 text-sm">Symptoms Severity</Label>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-2xl font-bold">{entry.symptoms_rating}/10</span>
                                  <Progress value={(10 - entry.symptoms_rating) * 10} className="flex-1 h-2" />
                                </div>
                              </div>
                              <div>
                                <Label className="text-gray-400 text-sm">Improvement Score</Label>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-2xl font-bold text-green-400">{entry.improvement_score}%</span>
                                  <Progress value={entry.improvement_score} className="flex-1 h-2" />
                                </div>
                              </div>
                            </div>

                            {entry.notes && (
                              <div>
                                <Label className="text-gray-400 text-sm">Notes</Label>
                                <p className="text-gray-300 mt-1 leading-relaxed">{entry.notes}</p>
                              </div>
                            )}
                          </div>

                          {entry.photos && entry.photos.length > 0 && (
                            <div className="lg:w-48">
                              <Label className="text-gray-400 text-sm block mb-2">Photos</Label>
                              <div className="grid grid-cols-2 gap-2">
                                {entry.photos.slice(0, 4).map((photo, photoIndex) => (
                                  <img
                                    key={photoIndex}
                                    src={photo || "/placeholder.svg"}
                                    alt={`Progress photo ${photoIndex + 1}`}
                                    className="w-full h-20 object-cover rounded border border-gray-600 hover:border-green-500 transition-colors cursor-pointer"
                                  />
                                ))}
                              </div>
                              {entry.photos.length > 4 && (
                                <p className="text-xs text-gray-400 mt-1">+{entry.photos.length - 4} more photos</p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Progress Data Yet</h3>
                    <p className="text-gray-300 mb-6">Start tracking your progress by adding your first entry</p>
                    <Button className="bg-green-500 hover:bg-green-600">Add First Entry</Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="insights">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Progress Chart Placeholder */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LineChart className="w-5 h-5 mr-2 text-green-400" />
                      Progress Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center border border-gray-700 rounded-lg bg-gray-800/50">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400">Chart visualization coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2 text-green-400" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Consistent Improvement</p>
                        <p className="text-gray-300 text-sm">
                          Your symptoms have improved by {overallProgress}% since starting treatment
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Regular Tracking</p>
                        <p className="text-gray-300 text-sm">
                          You've been consistent with tracking for {progressData.length} entries
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Treatment Effectiveness</p>
                        <p className="text-gray-300 text-sm">
                          Current treatment plan is showing{" "}
                          {progressTrend.trend === "improving" ? "positive" : "stable"} results
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="md:col-span-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-green-400" />
                      Personalized Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Continue Current Approach</h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li>• Maintain your current skincare routine</li>
                          <li>• Continue taking progress photos weekly</li>
                          <li>• Keep tracking symptoms daily</li>
                          <li>• Follow prescribed treatment plan</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Areas for Improvement</h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li>• Consider scheduling a follow-up consultation</li>
                          <li>• Track environmental factors affecting your skin</li>
                          <li>• Monitor diet and stress levels</li>
                          <li>• Document product reactions</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
