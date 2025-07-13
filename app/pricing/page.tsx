"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft, Check, Star, Shield, CreditCard, Globe } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (user) {
      router.push("/analysis")
    } else {
      router.push("/auth/sign-up")
    }
  }

  const handleUpgradeNow = () => {
    if (user) {
      router.push("/payment?amount=700&type=premium")
    } else {
      router.push("/auth/sign-up")
    }
  }

  const plans = [
    {
      name: "Basic Analysis",
      price: "Free",
      description: "Perfect for getting started with AI skin analysis",
      features: [
        "Basic skin condition detection",
        "General recommendations",
        "Confidence score",
        "Basic report",
        "Community support",
      ],
      buttonText: "Get Started Free",
      buttonAction: handleGetStarted,
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Detailed Analysis",
      price: "$7",
      originalPrice: "$12",
      description: "Complete skin health solution with expert insights",
      features: [
        "Advanced AI analysis",
        "Detailed treatment plan",
        "Risk factor analysis",
        "Progress tracking",
        "Expert consultation booking",
        "Priority support",
        "PDF reports",
        "Follow-up reminders",
      ],
      buttonText: "Upgrade Now",
      buttonAction: handleUpgradeNow,
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "Professional",
      price: isAnnual ? "$199" : "$29",
      description: "For healthcare professionals and clinics",
      features: [
        "Everything in Detailed Analysis",
        "Bulk analysis tools",
        "Patient management system",
        "White-label reports",
        "API access",
        "Custom integrations",
        "Dedicated support",
        "Training sessions",
      ],
      buttonText: "Contact Sales",
      buttonAction: () => window.open("mailto:aekukrishang@gmail.com?subject=Professional Plan Inquiry", "_blank"),
      buttonVariant: "outline" as const,
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all duration-300" />
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
                SkinSano
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-in">
                    <Button variant="ghost" className="text-gray-300 hover:text-white">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <Badge className="mb-6 bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Limited Time Offer - 40% Off
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Choose Your Plan</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Get professional-grade skin analysis with personalized treatment recommendations
            </p>

            {/* Annual Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-sm ${!isAnnual ? "text-white" : "text-gray-400"}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`text-sm ${isAnnual ? "text-white" : "text-gray-400"}`}>
                Annual
                <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">Save 30%</Badge>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`relative bg-gray-800/50 border backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-500 hover:scale-105 ${
                  plan.popular
                    ? "border-blue-500/50 bg-blue-500/10 shadow-2xl shadow-blue-500/10"
                    : "border-gray-700/50 hover:border-gray-600/50"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">{plan.originalPrice}</span>
                      )}
                      {plan.price !== "Free" && plan.name === "Professional" && (
                        <span className="text-gray-400">/{isAnnual ? "year" : "month"}</span>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-gray-300">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3 group">
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={plan.buttonAction}
                    className={`w-full transition-all duration-300 hover:scale-105 ${
                      plan.buttonVariant === "default"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white"
                    }`}
                    variant={plan.buttonVariant}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Secure Payment Options</h3>
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="flex items-center space-x-2 text-gray-300">
                <CreditCard className="w-5 h-5" />
                <span>Credit Cards</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Shield className="w-5 h-5" />
                <span>UPI</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Globe className="w-5 h-5" />
                <span>Net Banking</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">All payments are processed securely with Razorpay</p>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  question: "How accurate is the AI analysis?",
                  answer:
                    "Our AI has been trained on millions of dermatological cases and achieves 99.2% accuracy in skin condition detection, comparable to board-certified dermatologists.",
                },
                {
                  question: "Can I get a refund if I'm not satisfied?",
                  answer:
                    "Yes! We offer a 30-day money-back guarantee. If you're not completely satisfied with your analysis, we'll provide a full refund.",
                },
                {
                  question: "Is my data secure and private?",
                  answer:
                    "Absolutely. We use bank-level encryption and are fully HIPAA compliant. Your medical data is never shared without your explicit consent.",
                },
                {
                  question: "How quickly will I receive my results?",
                  answer:
                    "Basic analysis results are available instantly. Detailed analysis with treatment plans are typically ready within 30 seconds of upload.",
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm p-6 hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-500"
                >
                  <h4 className="text-lg font-semibold text-white mb-3">{faq.question}</h4>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 backdrop-blur-sm p-12 hover:from-blue-500/15 hover:to-purple-500/15 hover:border-blue-500/40 transition-all duration-500">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust SkinSano for professional-grade skin analysis
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                >
                  Start Free Analysis
                </Button>
                <Button
                  onClick={() => router.push("/consultation")}
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white px-8 transition-all duration-300 hover:scale-105"
                >
                  Book Consultation
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
