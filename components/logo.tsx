"use client"

import { useState } from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  // Custom SVG logo - you can replace this with your own design
  const CustomLogo = () => (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle with gradient */}
        <circle cx="50" cy="50" r="45" fill="url(#gradient)" stroke="#10B981" strokeWidth="2" />

        {/* Skin cell pattern */}
        <path d="M30 40 Q50 20 70 40 Q50 60 30 40" fill="#10B981" opacity="0.8" />

        {/* DNA helix representing AI analysis */}
        <path
          d="M25 30 Q35 25 45 30 Q55 35 65 30 Q75 25 85 30"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M25 70 Q35 75 45 70 Q55 65 65 70 Q75 75 85 70"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />

        {/* Central S for SkinSano */}
        <text x="50" y="58" textAnchor="middle" className="fill-white font-bold text-2xl">
          S
        </text>

        {/* Scanning lines effect */}
        <line x1="20" y1="35" x2="80" y2="35" stroke="#10B981" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="50" x2="80" y2="50" stroke="#10B981" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="65" x2="80" y2="65" stroke="#10B981" strokeWidth="1" opacity="0.5" />

        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )

  // Try to load custom logo image first, fallback to SVG
  if (imageError) {
    return (
      <div className="flex items-center space-x-2">
        <CustomLogo />
        <span className={`font-bold text-green-400 ${textSizeClasses[size]}`}>SkinSano</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <img
        src="/logo.png"
        alt="SkinSano Logo"
        className={`${sizeClasses[size]} ${className}`}
        onError={() => setImageError(true)}
      />
      <span className={`font-bold text-green-400 ${textSizeClasses[size]}`}>SkinSano</span>
    </div>
  )
}
