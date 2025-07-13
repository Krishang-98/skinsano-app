export interface Doctor {
  id: string
  name: string
  specialty: string
  experience: string
  rating: number
  reviews: number
  price: number
  image: string
  languages: string[]
  location: string
  bio: string
  education: string[]
  certifications: string[]
  availability: {
    [key: string]: string[] // day: time slots
  }
  consultationType: ("video" | "in-person")[]
}

export const doctors: Doctor[] = [
  {
    id: "dr-sarah-johnson",
    name: "Dr. Sarah Johnson",
    specialty: "Dermatologist & Cosmetic Specialist",
    experience: "12 years",
    rating: 4.9,
    reviews: 324,
    price: 899,
    image: "/placeholder.svg?height=120&width=120&text=Dr.+Johnson",
    languages: ["English", "Hindi"],
    location: "Downtown Medical Center, Mumbai",
    bio: "Dr. Sarah Johnson is a board-certified dermatologist with over 12 years of experience in treating various skin conditions and cosmetic procedures.",
    education: ["MBBS - King George Medical University", "MD Dermatology - AIIMS Delhi"],
    certifications: ["Board Certified Dermatologist", "Cosmetic Dermatology Specialist"],
    availability: {
      monday: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
      tuesday: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
      wednesday: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
      thursday: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
      friday: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
      saturday: ["9:00 AM", "11:00 AM"],
      sunday: [],
    },
    consultationType: ["video", "in-person"],
  },
  {
    id: "dr-raj-patel",
    name: "Dr. Raj Patel",
    specialty: "Clinical Dermatologist",
    experience: "8 years",
    rating: 4.8,
    reviews: 256,
    price: 799,
    image: "/placeholder.svg?height=120&width=120&text=Dr.+Patel",
    languages: ["English", "Hindi", "Gujarati"],
    location: "Westside Clinic, Pune",
    bio: "Dr. Raj Patel specializes in clinical dermatology with expertise in treating acne, eczema, and other skin disorders.",
    education: ["MBBS - Gujarat University", "MD Dermatology - BJ Medical College"],
    certifications: ["Board Certified Dermatologist", "Clinical Research Specialist"],
    availability: {
      monday: ["9:30 AM", "11:00 AM", "1:00 PM", "4:00 PM"],
      tuesday: ["9:30 AM", "11:00 AM", "1:00 PM", "4:00 PM"],
      wednesday: ["9:30 AM", "11:00 AM", "1:00 PM", "4:00 PM"],
      thursday: ["9:30 AM", "11:00 AM", "1:00 PM", "4:00 PM"],
      friday: ["9:30 AM", "11:00 AM", "1:00 PM", "4:00 PM"],
      saturday: ["10:00 AM", "12:00 PM"],
      sunday: [],
    },
    consultationType: ["video", "in-person"],
  },
  {
    id: "dr-lisa-chen",
    name: "Dr. Lisa Chen",
    specialty: "Pediatric & Adult Dermatology",
    experience: "15 years",
    rating: 4.9,
    reviews: 412,
    price: 999,
    image: "/placeholder.svg?height=120&width=120&text=Dr.+Chen",
    languages: ["English", "Hindi"],
    location: "Central Health Plaza, Delhi",
    bio: "Dr. Lisa Chen is an expert in both pediatric and adult dermatology with extensive experience in treating complex skin conditions.",
    education: ["MBBS - Delhi University", "MD Dermatology - AIIMS Delhi", "Fellowship in Pediatric Dermatology - USA"],
    certifications: ["Board Certified Dermatologist", "Pediatric Dermatology Specialist", "Mohs Surgery Certified"],
    availability: {
      monday: ["8:00 AM", "10:00 AM", "1:30 PM", "3:00 PM"],
      tuesday: ["8:00 AM", "10:00 AM", "1:30 PM", "3:00 PM"],
      wednesday: ["8:00 AM", "10:00 AM", "1:30 PM", "3:00 PM"],
      thursday: ["8:00 AM", "10:00 AM", "1:30 PM", "3:00 PM"],
      friday: ["8:00 AM", "10:00 AM", "1:30 PM", "3:00 PM"],
      saturday: ["9:00 AM", "11:00 AM"],
      sunday: [],
    },
    consultationType: ["video", "in-person"],
  },
]

// Helper function to get available slots for a specific date
export function getAvailableSlots(doctorId: string, date: Date): string[] {
  const doctor = doctors.find((d) => d.id === doctorId)
  if (!doctor) return []

  const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
  return doctor.availability[dayName] || []
}

// Helper function to add a new doctor
export function addDoctor(doctor: Omit<Doctor, "id">): Doctor {
  const newDoctor: Doctor = {
    ...doctor,
    id: `dr-${doctor.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
  }
  doctors.push(newDoctor)
  return newDoctor
}

// Helper function to update doctor availability
export function updateDoctorAvailability(doctorId: string, availability: Doctor["availability"]): boolean {
  const doctorIndex = doctors.findIndex((d) => d.id === doctorId)
  if (doctorIndex === -1) return false

  doctors[doctorIndex].availability = availability
  return true
}
