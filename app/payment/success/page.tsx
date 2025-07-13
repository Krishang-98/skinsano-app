"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, CheckCircle2, Download, Calendar, ArrowRight, Mail, FileText, Star } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setShowConfetti(true)
    // Send confirmation email simulation
    setTimeout(() => {
      console.log("Confirmation email sent")
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">SkinSano</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Payment Successful
            </Badge>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8 animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/25 animate-pulse-glow">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Thank you for your purchase. Your detailed skin analysis is now being prepared.
            </p>
          </div>

          {/* Order Details */}
          <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm p-8 mb-8 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-500 animate-fade-in-up animation-delay-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white mb-4">Order Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Order ID:</span>
                    <span className="text-white font-mono">#SS-2024-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Product:</span>
                    <span className="text-white">Detailed Skin Analysis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amount Paid:</span>
                    <span className="text-green-400 font-semibold">$7.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Payment Method:</span>
                    <span className="text-white">Razorpay</span>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Upload Your Photos</div>
                      <div className="text-gray-400 text-sm">Start your detailed analysis</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Get AI Analysis</div>
                      <div className="text-gray-400 text-sm">Receive detailed results in 30 seconds</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Book Consultation</div>
                      <div className="text-gray-400 text-sm">Optional expert review</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in-up animation-delay-400">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 backdrop-blur-sm p-6 hover:from-blue-500/15 hover:to-purple-500/15 hover:border-blue-500/40 transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Start Analysis</h3>
                <p className="text-gray-300 text-sm mb-4">Upload photos and begin your detailed skin analysis</p>
                <Link href="/analysis">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105 group">
                    Begin Analysis
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm p-6 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Download Receipt</h3>
                <p className="text-gray-300 text-sm mb-4">Get your payment receipt for your records</p>
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <FileText className="mr-2 w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            </Card>

            <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm p-6 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 group">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Book Consultation</h3>
                <p className="text-gray-300 text-sm mb-4">Schedule a video call with a dermatologist</p>
                <Link href="/consultation">
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    <Calendar className="mr-2 w-4 h-4" />
                    Schedule Now
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Email Confirmation */}
          <Card className="bg-green-500/10 border border-green-500/30 backdrop-blur-sm p-6 hover:bg-green-500/15 hover:border-green-500/40 transition-all duration-500 animate-fade-in-up animation-delay-600">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Mail className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Confirmation Email Sent</h3>
            </div>
            <p className="text-gray-300 text-center">
              We've sent a confirmation email with your order details and next steps. Check your inbox!
            </p>
          </Card>

          {/* Support */}
          <div className="mt-12 text-center animate-fade-in-up animation-delay-800">
            <p className="text-gray-400 mb-4">Need help? Our support team is here for you 24/7</p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all duration-300"
              >
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all duration-300"
              >
                <Star className="mr-2 w-4 h-4" />
                Rate Experience
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
