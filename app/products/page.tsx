"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  ArrowLeft,
  Star,
  ShoppingBag,
  Search,
  Filter,
  Heart,
  ExternalLink,
  CheckCircle2,
  Award,
  Truck,
  Shield,
} from "lucide-react"
import Link from "next/link"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [favorites, setFavorites] = useState<string[]>([])

  const categories = [
    { id: "all", name: "All Products", count: 24 },
    { id: "cleansers", name: "Cleansers", count: 8 },
    { id: "moisturizers", name: "Moisturizers", count: 6 },
    { id: "treatments", name: "Treatments", count: 10 },
  ]

  const products = [
    {
      id: "1",
      name: "CeraVe Foaming Facial Cleanser",
      category: "cleansers",
      price: 12.99,
      originalPrice: 16.99,
      rating: 4.5,
      reviews: 2847,
      match: 96,
      image: "/placeholder.svg?height=200&width=200",
      description: "Gentle foaming cleanser with ceramides and hyaluronic acid",
      benefits: ["Removes excess oil", "Maintains skin barrier", "Non-comedogenic"],
      ingredients: ["Ceramides", "Hyaluronic Acid", "Niacinamide"],
      skinTypes: ["Oily", "Combination", "Normal"],
      brand: "CeraVe",
      size: "355ml",
      inStock: true,
      fastShipping: true,
      dermatologistRecommended: true,
    },
    {
      id: "2",
      name: "Nizoral A-D Anti-Dandruff Shampoo",
      category: "treatments",
      price: 15.49,
      originalPrice: 19.99,
      rating: 4.6,
      reviews: 1923,
      match: 94,
      image: "/placeholder.svg?height=200&width=200",
      description: "Ketoconazole 1% anti-fungal treatment shampoo",
      benefits: ["Controls dandruff", "Reduces flaking", "Antifungal action"],
      ingredients: ["Ketoconazole 1%"],
      skinTypes: ["All types"],
      brand: "Nizoral",
      size: "200ml",
      inStock: true,
      fastShipping: true,
      dermatologistRecommended: true,
    },
    {
      id: "3",
      name: "Vanicream Moisturizing Cream",
      category: "moisturizers",
      price: 8.99,
      originalPrice: 12.99,
      rating: 4.7,
      reviews: 3156,
      match: 91,
      image: "/placeholder.svg?height=200&width=200",
      description: "Gentle moisturizing cream for sensitive skin",
      benefits: ["Deep hydration", "Fragrance-free", "Hypoallergenic"],
      ingredients: ["Petrolatum", "Glycerin", "Sorbitol"],
      skinTypes: ["Sensitive", "Dry", "All types"],
      brand: "Vanicream",
      size: "453g",
      inStock: true,
      fastShipping: false,
      dermatologistRecommended: true,
    },
    {
      id: "4",
      name: "La Roche-Posay Toleriane Cleanser",
      category: "cleansers",
      price: 14.99,
      originalPrice: 18.99,
      rating: 4.4,
      reviews: 1567,
      match: 89,
      image: "/placeholder.svg?height=200&width=200",
      description: "Ultra-gentle cleanser for sensitive skin",
      benefits: ["Removes makeup", "Preserves skin barrier", "Soap-free"],
      ingredients: ["Thermal Spring Water", "Glycerin"],
      skinTypes: ["Sensitive", "Dry", "Normal"],
      brand: "La Roche-Posay",
      size: "200ml",
      inStock: true,
      fastShipping: true,
      dermatologistRecommended: true,
    },
    {
      id: "5",
      name: "Eucerin Advanced Repair Lotion",
      category: "moisturizers",
      price: 9.99,
      originalPrice: 13.99,
      rating: 4.3,
      reviews: 892,
      match: 87,
      image: "/placeholder.svg?height=200&width=200",
      description: "Fragrance-free body lotion for very dry skin",
      benefits: ["24-hour hydration", "Fragrance-free", "Fast-absorbing"],
      ingredients: ["Ceramides", "Natural Moisturizing Factors"],
      skinTypes: ["Dry", "Very dry", "Sensitive"],
      brand: "Eucerin",
      size: "500ml",
      inStock: false,
      fastShipping: false,
      dermatologistRecommended: true,
    },
    {
      id: "6",
      name: "Hydrocortisone Cream 1%",
      category: "treatments",
      price: 6.99,
      originalPrice: 9.99,
      rating: 4.2,
      reviews: 654,
      match: 85,
      image: "/placeholder.svg?height=200&width=200",
      description: "Anti-inflammatory cream for eczema and dermatitis",
      benefits: ["Reduces inflammation", "Relieves itching", "Fast-acting"],
      ingredients: ["Hydrocortisone 1%"],
      skinTypes: ["All types"],
      brand: "Generic",
      size: "30g",
      inStock: true,
      fastShipping: true,
      dermatologistRecommended: false,
    },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

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
            <Link href="/results" className="flex items-center space-x-3 group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all duration-300" />
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
                SkinSano
              </span>
            </Link>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Recommended Products
            </Badge>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Recommended Products</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Curated skincare products specifically recommended for your skin condition
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8 animate-fade-in-up animation-delay-200">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all duration-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all duration-300"
              >
                <Heart className="w-4 h-4 mr-2" />
                Favorites ({favorites.length})
              </Button>
            </div>
          </div>

          {/* Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
                >
                  {category.name} ({category.count})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredProducts.map((product, index) => (
              <Card
                key={product.id}
                className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative p-6">
                  {/* Product Image */}
                  <div className="relative mb-4">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg border border-gray-600 group-hover:border-gray-500 transition-all duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col space-y-1">
                      {product.match >= 90 && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          {product.match}% Match
                        </Badge>
                      )}
                      {product.dermatologistRecommended && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Dermatologist Recommended
                        </Badge>
                      )}
                      {product.fastShipping && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                          <Truck className="w-3 h-3 mr-1" />
                          Fast Shipping
                        </Badge>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-2 bg-gray-900/80 rounded-full hover:bg-gray-800 transition-all duration-300 hover:scale-110"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors duration-300 ${
                          favorites.includes(product.id) ? "text-red-400 fill-current" : "text-gray-400"
                        }`}
                      />
                    </button>

                    {/* Stock Status */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-gray-900/80 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {product.brand} • {product.size}
                      </p>
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-2">{product.description}</p>

                    {/* Benefits */}
                    <div className="flex flex-wrap gap-1">
                      {product.benefits.slice(0, 2).map((benefit, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="border-gray-600 text-gray-300 text-xs hover:border-gray-500 hover:text-white transition-all duration-300"
                        >
                          {benefit}
                        </Badge>
                      ))}
                      {product.benefits.length > 2 && (
                        <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          +{product.benefits.length - 2} more
                        </Badge>
                      )}
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-white font-medium ml-1">{product.rating}</span>
                        </div>
                        <span className="text-gray-400 text-sm">({product.reviews})</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                            ${product.price}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                        {product.originalPrice > product.price && (
                          <div className="text-xs text-green-400">
                            Save ${(product.originalPrice - product.price).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105 group"
                        disabled={!product.inStock}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white transition-all duration-300 hover:scale-105"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-gray-300 mb-6">Try adjusting your search or filter criteria</p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm p-6 text-center hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-500">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Dermatologist Approved</h3>
              <p className="text-gray-300 text-sm">
                All products are reviewed and approved by board-certified dermatologists
              </p>
            </Card>

            <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm p-6 text-center hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-500">
              <Truck className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Fast & Free Shipping</h3>
              <p className="text-gray-300 text-sm">
                Free shipping on orders over $25 with fast delivery options available
              </p>
            </Card>

            <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm p-6 text-center hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-500">
              <CheckCircle2 className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Satisfaction Guarantee</h3>
              <p className="text-gray-300 text-sm">
                30-day money-back guarantee on all products if you're not satisfied
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
