'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  content: string
  rating: number
  university: string
  country: string
  imageUrl?: string
  isFeatured: boolean
  isActive: boolean
  createdAt: Date
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials')
        if (response.ok) {
          const data = await response.json()
          setTestimonials(data.filter((t: Testimonial) => t.isActive).slice(0, 6))
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error)
      }
    }

    fetchTestimonials()
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  // If no testimonials, show empty state
  if (testimonials.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from students who achieved their dreams
            </p>
          </div>
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Star className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No Testimonials Yet
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We're waiting to share the success stories of our future students. 
                Be among the first to achieve your study abroad dreams with us!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/contact">
                  <button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    Start Your Journey
                  </button>
                </a>
                <a href="/admin/login">
                  <button className="border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white text-primary px-6 py-3 rounded-lg transition-all duration-300">
                    Admin Access
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Student Success Stories
          </h2>
          <p className="text-xl text-gray-600">
            Hear from students who achieved their dreams with our guidance
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                  {testimonial.isFeatured && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-4">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  {testimonial.imageUrl ? (
                    <>
                      <img 
                        src={testimonial.imageUrl} 
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.classList.remove('hidden')
                        }}
                      />
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3 hidden">
                        <span className="text-white font-medium">
                          {testimonial.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.university}</p>
                    <p className="text-xs text-gray-400">{testimonial.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}