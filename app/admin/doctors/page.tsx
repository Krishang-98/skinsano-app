"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { doctors } from "@/lib/doctors"
import { Clock, User, MapPin, Star, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react"

export default function DoctorManagementPage() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [doctorsList, setDoctorsList] = useState([...doctors])
  const [isAddingDoctor, setIsAddingDoctor] = useState(false)
  const [isEditingDoctor, setIsEditingDoctor] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    experience: "",
    location: "",
    languages: "",
    price: "",
    rating: "4.8",
    reviews: "120",
    image: "",
    availability: {
      monday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
      tuesday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
      wednesday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
      thursday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
      friday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
    },
  })

  useEffect(() => {
    // Check if user is admin
    if (user && (user.role === "admin" || user.role === "power_user")) {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleAddDoctor = () => {
    const newDoctor = {
      id: `doctor-${Date.now()}`,
      name: formData.name,
      specialty: formData.specialty,
      experience: formData.experience,
      location: formData.location,
      languages: formData.languages.split(",").map((lang) => lang.trim()),
      price: Number.parseInt(formData.price),
      rating: Number.parseFloat(formData.rating),
      reviews: Number.parseInt(formData.reviews),
      image: formData.image,
      availability: formData.availability,
    }
    setDoctorsList([...doctorsList, newDoctor])
    setIsAddingDoctor(false)
    setFormData({
      name: "",
      specialty: "",
      experience: "",
      location: "",
      languages: "",
      price: "",
      rating: "4.8",
      reviews: "120",
      image: "",
      availability: {
        monday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
        tuesday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
        wednesday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
        thursday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
        friday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
      },
    })
  }

  const handleEditDoctor = () => {
    const updatedDoctorsList = doctorsList.map((doctor) => {
      if (doctor.id === selectedDoctor.id) {
        return {
          ...doctor,
          name: formData.name,
          specialty: formData.specialty,
          experience: formData.experience,
          location: formData.location,
          languages: formData.languages.split(",").map((lang) => lang.trim()),
          price: Number.parseInt(formData.price),
          rating: Number.parseFloat(formData.rating),
          reviews: Number.parseInt(formData.reviews),
          image: formData.image,
          availability: formData.availability,
        }
      }
      return doctor
    })
    setDoctorsList(updatedDoctorsList)
    setIsEditingDoctor(false)
    setSelectedDoctor(null)
    setFormData({
      name: "",
      specialty: "",
      experience: "",
      location: "",
      languages: "",
      price: "",
      rating: "4.8",
      reviews: "120",
      image: "",
      availability: {
        monday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
        tuesday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
        wednesday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
        thursday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
        friday: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
      },
    })
  }

  const handleDeleteDoctor = (id: string) => {
    const updatedDoctorsList = doctorsList.filter((doctor) => doctor.id !== id)
    setDoctorsList(updatedDoctorsList)
  }

  const handleSelectDoctor = (doctor: any) => {
    setSelectedDoctor(doctor)
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      experience: doctor.experience,
      location: doctor.location,
      languages: doctor.languages.join(", "),
      price: doctor.price.toString(),
      rating: doctor.rating.toString(),
      reviews: doctor.reviews.toString(),
      image: doctor.image,
      availability: doctor.availability,
    })
    setIsEditingDoctor(true)
  }

  return (
    <AuthGuard>
      {isAdmin ? (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-bold">Doctor Management</CardTitle>
            <Button onClick={() => setIsAddingDoctor(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Doctor
            </Button>
          </div>
          {isAddingDoctor && (
            <div className="mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Specialty</Label>
                      <Input name="specialty" value={formData.specialty} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <Input name="experience" value={formData.experience} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input name="location" value={formData.location} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Languages</Label>
                      <Input name="languages" value={formData.languages} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input name="price" value={formData.price} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <Input name="rating" value={formData.rating} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Reviews</Label>
                      <Input name="reviews" value={formData.reviews} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Image URL</Label>
                      <Input name="image" value={formData.image} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleAddDoctor}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Add Doctor
                    </Button>
                    <Button onClick={() => setIsAddingDoctor(false)}>
                      <XCircle className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {isEditingDoctor && selectedDoctor && (
            <div className="mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Specialty</Label>
                      <Input name="specialty" value={formData.specialty} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <Input name="experience" value={formData.experience} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input name="location" value={formData.location} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Languages</Label>
                      <Input name="languages" value={formData.languages} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input name="price" value={formData.price} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <Input name="rating" value={formData.rating} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Reviews</Label>
                      <Input name="reviews" value={formData.reviews} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label>Image URL</Label>
                      <Input name="image" value={formData.image} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleEditDoctor}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                    <Button onClick={() => setIsEditingDoctor(false)}>
                      <XCircle className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorsList.map((doctor) => (
              <Card key={doctor.id}>
                <CardHeader>
                  <CardTitle>{doctor.name}</CardTitle>
                  <CardDescription>{doctor.specialty}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2">
                    <User className="mr-2 h-4 w-4" />
                    <span>{doctor.experience} years</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{doctor.location}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Star className="mr-2 h-4 w-4" />
                    <span>{doctor.rating}</span>
                    <Badge className="ml-2">{doctor.reviews} reviews</Badge>
                  </div>
                  <div className="flex items-center mb-2">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>{doctor.languages.join(", ")}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>${doctor.price}</span>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSelectDoctor(doctor)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button onClick={() => handleDeleteDoctor(doctor.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <AlertCircle className="mr-2 h-8 w-8" />
                <span>You do not have permission to access this page.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AuthGuard>
  )
}
