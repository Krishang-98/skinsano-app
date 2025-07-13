"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AuthGuard } from "@/components/auth-guard"
import { Logo } from "@/components/logo"
import {
  ArrowLeft,
  Star,
  Clock,
  Video,
  Shield,
  Award,
  User,
  MapPin,
  CheckCircle,
  Sparkles,
  CalendarIcon,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DatabaseService } from "@/lib/database"
import { isSupabaseConfigured } from "@/lib/supabase"
import { doctors, getAvailableSlots } from "@/lib/doctors"

export default function ConsultationPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [consultationType, setConsultationType] = useState<"in-person" | "video">("video")
  const [concerns, setConcerns] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meetingLink, setMeetingLink] = useState<string>("")
  const router = useRouter()
  const { user } = useAuth()

  const selectedDoctorData = doctors.find((d) => d.id === selectedDoctor)
  const availableSlots = selectedDate && selectedDoctor ? getAvailableSlots(selectedDoctor, selectedDate) : []

  // Generate Google Meet link
  const generateMeetingLink = () => {
    if (consultationType === "video") {
      // Generate a Google Meet link (in real app, this would be done server-side)
      const meetingId = `skinsano-${Date.now()}`
      return `https://meet.google.com/${meetingId}`
    }
    return ""
  }

  const handleBookConsultation = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor || !user) {
      setError("Please complete all required fields")
      return
    }

    setIsBooking(true)
    setError(null)

    try {
      const doctorData = doctors.find((d) => d.id === selectedDoctor)
      if (!doctorData) {
        throw new Error("Doctor not found")
      }

      // Generate meeting link for video consultations
      const generatedMeetingLink = generateMeetingLink()
      setMeetingLink(generatedMeetingLink)

      // For demo mode or when Supabase is not configured
      if (!isSupabaseConfigured()) {
        // Show success message after a short delay
        setTimeout(() => {
          setShowSuccess(true)

          // Redirect to payment after 3 seconds
          setTimeout(() => {
            router.push(
              `/payment?type=consultation&amount=${doctorData.price}&consultationId=demo-consultation-${Date.now()}`,
            )
          }, 3000)
        }, 1000)
        return
      }

      // Real database operation
      const consultationData = {
        user_id: user.id,
        doctor_id: selectedDoctor,
        doctor_name: doctorData.name,
        scheduled_date: selectedDate.toISOString().split("T")[0],
        scheduled_time: selectedTime,
        consultation_type: consultationType,
        amount: doctorData.price,
        status: "scheduled",
        meeting_url: generatedMeetingLink,
        notes: concerns,
      }

      const { data: consultation, error: consultationError } =
        await DatabaseService.createConsultation(consultationData)

      if (consultationError) {
        console.error("Consultation creation failed:", consultationError)
        // Continue anyway with fallback
      }

      if (!consultation) {
        throw new Error("Failed to create consultation")
      }

      // Show success message
      setShowSuccess(true)

      // Redirect to payment after 3 seconds
      setTimeout(() => {
        router.push(
          `/payment?type=consultation&amount=${doctorData.price}&consultationId=${consultation.id || "fallback-" + Date.now()}`,
        )
      }, 3000)
    } catch (error: any) {
      console.error("Booking error:", error)
      setError(error.message || "Failed to book consultation. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  const isFormComplete = selectedDate && selectedTime && selectedDoctor

  const steps = [
    { number: 1, title: "Choose Doctor", description: "Select your preferred specialist" },
    { number: 2, title: "Pick Date & Time", description: "Schedule your appointment" },
    { number: 3, title: "Consultation Details", description: "Add your concerns" },
    { number: 4, title: "Confirm Booking", description: "Review and confirm" },
  ]

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-8">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">Appointment Scheduled!</h2>
            <p className="text-gray-400 text-center mb-6">
              Your consultation with {selectedDoctorData?.name} has been scheduled for{" "}
              {selectedDate?.toLocaleDateString()} at {selectedTime}.
            </p>

            {/* Meeting Link Section */}
            {consultationType === "video" && meetingLink && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 w-full">
                <div className="flex items-start">
                  <Video className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-200 font-medium mb-2">Video Consultation Link:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-300 flex-1 break-all">
                        {meetingLink}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                        onClick={() => window.open(meetingLink, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-blue-300/80 mt-2">
                      You'll receive this link via email. Join 5 minutes before your appointment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {consultationType === "in-person" && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 w-full">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-200 font-medium mb-1">Clinic Address:</p>
                    <p className="text-sm text-green-300">{selectedDoctorData?.location}</p>
                    <p className="text-xs text-green-300/80 mt-2">
                      Please arrive 10 minutes early for your appointment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 w-full">
              <p className="text-gray-300 text-sm text-center">
                <strong>📧 Email Confirmation:</strong> You will receive a detailed email with all consultation
                information, preparation instructions, and{" "}
                {consultationType === "video" ? "meeting link" : "clinic directions"} within the next few minutes.
              </p>
            </div>

            <p className="text-gray-500 text-sm text-center">Redirecting to payment page...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Video className="w-4 h-4 mr-2" />
                  Consultation Booking
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-purple-400 mr-3" />
              <h1 className="text-4xl font-bold">Book Expert Consultation</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Connect with board-certified dermatologists via Google Meet or in-person visits
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      currentStep >= step.number
                        ? "bg-purple-500 border-purple-500 text-black"
                        : "border-gray-600 text-gray-400"
                    }`}
                  >
                    {currentStep > step.number ? <CheckCircle className="w-6 h-6" /> : step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${currentStep > step.number ? "bg-purple-500" : "bg-gray-600"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{steps[currentStep - 1].title}</h2>
              <p className="text-gray-400">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          {isBooking ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-bold mb-4">Scheduling Your Consultation</h2>
                <p className="text-gray-400 text-center max-w-md">
                  We're confirming your appointment with {selectedDoctorData?.name} and setting up your{" "}
                  {consultationType === "video" ? "Google Meet link" : "clinic visit"}. Please wait...
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Step 1: Choose Doctor */}
              {currentStep === 1 && (
                <div className="grid gap-6">
                  <h3 className="text-xl font-semibold mb-4">Select Your Dermatologist</h3>
                  <RadioGroup value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <div className="grid gap-4">
                      {doctors.map((doctor) => (
                        <div key={doctor.id}>
                          <RadioGroupItem value={doctor.id} id={doctor.id} className="sr-only" />
                          <Label htmlFor={doctor.id} className="cursor-pointer">
                            <Card
                              className={`transition-all hover:border-purple-500 ${
                                selectedDoctor === doctor.id
                                  ? "border-purple-500 bg-purple-500/5"
                                  : "border-gray-800 bg-gray-900"
                              }`}
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                  <img
                                    src={doctor.image || "/placeholder.svg?height=80&width=80&query=doctor"}
                                    alt={doctor.name}
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="text-lg font-semibold">{doctor.name}</h4>
                                        <p className="text-purple-400 text-sm">{doctor.specialty}</p>
                                        <p className="text-gray-400 text-sm">{doctor.experience} experience</p>
                                        <div className="flex items-center mt-1">
                                          <MapPin className="w-3 h-3 text-gray-500 mr-1" />
                                          <span className="text-xs text-gray-500">{doctor.location}</span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-2xl font-bold text-purple-400">₹{doctor.price}</div>
                                        <div className="text-sm text-gray-400">per session</div>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-4 mt-3">
                                      <div className="flex items-center">
                                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                        <span className="text-sm font-medium">{doctor.rating}</span>
                                        <span className="text-sm text-gray-400 ml-1">({doctor.reviews} reviews)</span>
                                      </div>
                                      <div className="flex items-center">
                                        <User className="w-4 h-4 text-gray-400 mr-1" />
                                        <span className="text-sm text-gray-400">{doctor.languages.join(", ")}</span>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                      <Badge variant="secondary" className="text-xs">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Board Certified
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        <Video className="w-3 h-3 mr-1" />
                                        Google Meet
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        <Award className="w-3 h-3 mr-1" />
                                        Top Rated
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedDoctor}
                    className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 py-6 text-lg"
                  >
                    Continue to Date & Time
                  </Button>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {currentStep === 2 && (
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Enhanced Date Picker */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-purple-400 mr-2" />
                        Select Date
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date)
                            setSelectedTime("") // Reset time when date changes
                          }}
                          className="w-full"
                          classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center text-white",
                            caption_label: "text-sm font-medium text-white",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 text-gray-400 hover:text-white",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-purple-500/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal text-white hover:bg-purple-500/20 hover:text-white rounded-md transition-colors",
                            day_selected:
                              "bg-purple-500 text-black hover:bg-purple-600 hover:text-black focus:bg-purple-500 focus:text-black",
                            day_today: "bg-gray-700 text-white",
                            day_outside: "text-gray-600 opacity-50",
                            day_disabled: "text-gray-600 opacity-50 cursor-not-allowed",
                            day_range_middle: "aria-selected:bg-purple-500/20 aria-selected:text-white",
                            day_hidden: "invisible",
                          }}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const day = date.getDay()
                            return date < today || day === 0 || day === 6
                          }}
                        />
                      </div>
                      {selectedDate && (
                        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <p className="text-sm text-purple-400 font-medium">
                            Selected:{" "}
                            {selectedDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Time Slots */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center">
                        <Clock className="w-5 h-5 text-purple-400 mr-2" />
                        Available Time Slots
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedDate ? (
                        availableSlots.length > 0 ? (
                          <RadioGroup value={selectedTime} onValueChange={setSelectedTime}>
                            <div className="grid grid-cols-2 gap-3">
                              {availableSlots.map((time) => (
                                <div key={time}>
                                  <RadioGroupItem value={time} id={`time-${time}`} className="sr-only" />
                                  <Label
                                    htmlFor={`time-${time}`}
                                    className={`flex items-center justify-center px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                                      selectedTime === time
                                        ? "bg-purple-500 border-purple-500 text-black font-medium"
                                        : "bg-gray-800 border-gray-700 hover:border-purple-500 hover:bg-gray-750"
                                    }`}
                                  >
                                    <Clock className="w-4 h-4 mr-2" />
                                    {time}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        ) : (
                          <div className="text-center py-12">
                            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No available slots for this date</p>
                            <p className="text-sm text-gray-500 mt-1">Please select another date</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-12">
                          <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">Please select a date first</p>
                          <p className="text-sm text-gray-500 mt-1">Available Monday - Friday</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="lg:col-span-2 flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!selectedDate || !selectedTime}
                      className="flex-1 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Consultation Details */}
              {currentStep === 3 && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>Consultation Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={consultationType}
                        onValueChange={(value: "in-person" | "video") => setConsultationType(value)}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <RadioGroupItem value="video" id="video" className="sr-only" />
                            <Label
                              htmlFor="video"
                              className={`flex flex-col items-center p-6 rounded-lg border cursor-pointer transition-all ${
                                consultationType === "video"
                                  ? "bg-purple-500/10 border-purple-500"
                                  : "bg-gray-800 border-gray-700 hover:border-purple-500"
                              }`}
                            >
                              <Video className="w-8 h-8 mb-3 text-purple-400" />
                              <span className="font-medium text-lg">Google Meet</span>
                              <span className="text-sm text-gray-400 text-center mt-1">
                                Secure video consultation from anywhere
                              </span>
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem value="in-person" id="in-person" className="sr-only" />
                            <Label
                              htmlFor="in-person"
                              className={`flex flex-col items-center p-6 rounded-lg border cursor-pointer transition-all ${
                                consultationType === "in-person"
                                  ? "bg-purple-500/10 border-purple-500"
                                  : "bg-gray-800 border-gray-700 hover:border-purple-500"
                              }`}
                            >
                              <MapPin className="w-8 h-8 mb-3 text-purple-400" />
                              <span className="font-medium text-lg">In Person</span>
                              <span className="text-sm text-gray-400 text-center mt-1">
                                Face-to-face at doctor's clinic
                              </span>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>

                      {consultationType === "video" && (
                        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <div className="flex items-start">
                            <Video className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-blue-200 font-medium mb-1">Google Meet Video Call</p>
                              <p className="text-sm text-blue-300">
                                You'll receive a Google Meet link via email. Join from any device with internet access.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {consultationType === "in-person" && selectedDoctorData && (
                        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-blue-200 font-medium mb-1">Clinic Location</p>
                              <p className="text-sm text-blue-300">{selectedDoctorData.location}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>Describe Your Concerns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Please describe your skin concerns, symptoms, current treatments, and any questions you have for the dermatologist..."
                        value={concerns}
                        onChange={(e) => setConcerns(e.target.value)}
                        className="min-h-32 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                        maxLength={500}
                      />
                      <div className="text-sm text-gray-400 mt-2">{concerns.length}/500 characters</div>
                    </CardContent>
                  </Card>

                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      className="flex-1 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600"
                    >
                      Review Booking
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirm Booking */}
              {currentStep === 4 && (
                <div className="max-w-2xl mx-auto">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="w-6 h-6 text-purple-400 mr-2" />
                        Confirm Your Booking
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Doctor Summary */}
                      <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                        <img
                          src={selectedDoctorData?.image || "/placeholder.svg?height=64&width=64&query=doctor"}
                          alt={selectedDoctorData?.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{selectedDoctorData?.name}</h4>
                          <p className="text-purple-400 text-sm">{selectedDoctorData?.specialty}</p>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{selectedDoctorData?.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-purple-400">₹{selectedDoctorData?.price}</div>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Date & Time</span>
                          <span className="font-medium">
                            {selectedDate?.toLocaleDateString()} at {selectedTime}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Consultation Type</span>
                          <span className="font-medium capitalize flex items-center">
                            {consultationType === "video" ? (
                              <Video className="w-4 h-4 mr-1 text-purple-400" />
                            ) : (
                              <MapPin className="w-4 h-4 mr-1 text-purple-400" />
                            )}
                            {consultationType === "video" ? "Google Meet" : "In Person"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Duration</span>
                          <span className="font-medium">30 minutes</span>
                        </div>
                      </div>

                      {/* Concerns */}
                      {concerns && (
                        <div className="space-y-2">
                          <h4 className="text-gray-400">Your Concerns</h4>
                          <div className="p-3 bg-gray-800 rounded-lg">
                            <p className="text-sm">{concerns}</p>
                          </div>
                        </div>
                      )}

                      {/* Payment Summary */}
                      <div className="space-y-2 pt-4 border-t border-gray-800">
                        <h4 className="font-medium">Payment Summary</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Consultation Fee</span>
                          <span>₹{selectedDoctorData?.price}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-gray-800">
                          <span>Total</span>
                          <span className="text-purple-400">₹{selectedDoctorData?.price}</span>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="p-4 bg-gray-800 rounded-lg text-sm text-gray-400">
                        <p>
                          By confirming this booking, you agree to our{" "}
                          <Link href="#" className="text-purple-400 hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="#" className="text-purple-400 hover:underline">
                            Cancellation Policy
                          </Link>
                          . You can reschedule or cancel up to 24 hours before your appointment.
                        </p>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(3)}
                          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleBookConsultation}
                          disabled={!isFormComplete}
                          className="flex-1 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 py-6 text-lg"
                        >
                          Confirm & Pay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
