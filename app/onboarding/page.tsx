"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Form state
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [skinType, setSkinType] = useState("")
  const [concerns, setConcerns] = useState<string[]>([])

  const skinConcerns = ["Acne", "Wrinkles", "Dryness", "Redness", "Dark spots", "Oiliness", "Sensitivity", "Rosacea"]

  const toggleConcern = (concern: string) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter((c) => c !== concern))
    } else {
      setConcerns([...concerns, concern])
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)

    try {
      // This would be replaced with your actual API call to save user profile
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect to dashboard after successful onboarding
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="w-full max-w-md px-4 py-8 animate-fade-in-up">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-semibold text-white">SkinSano</span>
        </div>

        <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm p-8 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-500">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
            <p className="text-gray-400 mt-1">Help us personalize your skin analysis</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-500" : "bg-gray-700"}`}
              >
                {step > 1 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span>1</span>}
              </div>
              <div className={`w-10 h-1 ${step >= 2 ? "bg-blue-500" : "bg-gray-700"}`}></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-500" : "bg-gray-700"}`}
              >
                {step > 2 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span>2</span>}
              </div>
              <div className={`w-10 h-1 ${step >= 3 ? "bg-blue-500" : "bg-gray-700"}`}></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-500" : "bg-gray-700"}`}
              >
                <span>3</span>
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-gray-300">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Gender</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" className="text-blue-500" />
                    <Label htmlFor="male" className="text-gray-300">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" className="text-blue-500" />
                    <Label htmlFor="female" className="text-gray-300">
                      Female
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" className="text-blue-500" />
                    <Label htmlFor="other" className="text-gray-300">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 2: Skin Type */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skinType" className="text-gray-300">
                  Skin Type
                </Label>
                <Select value={skinType} onValueChange={setSkinType}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select your skin type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="dry">Dry</SelectItem>
                    <SelectItem value="oily">Oily</SelectItem>
                    <SelectItem value="combination">Combination</SelectItem>
                    <SelectItem value="sensitive">Sensitive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Skin Concerns */}
          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-gray-300">Skin Concerns (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3">
                {skinConcerns.map((concern) => (
                  <Button
                    key={concern}
                    type="button"
                    variant={concerns.includes(concern) ? "default" : "outline"}
                    className={
                      concerns.includes(concern)
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white"
                    }
                    onClick={() => toggleConcern(concern)}
                  >
                    {concern}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all duration-300"
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}

            <Button
              type="button"
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 group"
              disabled={isLoading || (step === 1 && (!age || !gender)) || (step === 2 && !skinType)}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : step === 3 ? (
                "Complete Profile"
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
