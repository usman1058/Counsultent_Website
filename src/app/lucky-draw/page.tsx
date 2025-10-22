'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Gift, Trophy, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Navbar from '@/components/navbar'
import { useSocket } from '@/hooks/use-socket'

const luckyDrawSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Please select or enter a country'),
  reason: z.string().min(20, 'Please tell us why you want to study abroad (at least 20 characters)')
})

type LuckyDrawFormData = z.infer<typeof luckyDrawSchema>

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
  'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Switzerland', 'Austria', 'Belgium', 'Ireland', 'Portugal', 'Greece',
  'India', 'China', 'Japan', 'South Korea', 'Singapore', 'Malaysia',
  'UAE', 'Saudi Arabia', 'Israel', 'Turkey', 'Egypt', 'South Africa',
  'Brazil', 'Argentina', 'Mexico', 'Chile', 'Colombia', 'Peru',
  'New Zealand', 'Others'
]

export default function LuckyDrawPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const { notifyLuckyDrawEntry } = useSocket()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<LuckyDrawFormData>({
    resolver: zodResolver(luckyDrawSchema)
  })

  const selectedCountry = watch('country')

  const onSubmit = async (data: LuckyDrawFormData) => {
    if (!isActive) {
      toast.error('The lucky draw is currently not active.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/lucky-draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Your lucky draw entry has been submitted successfully! Good luck!')
        setIsSubmitted(true)
        
        // Send real-time notification to admin
        notifyLuckyDrawEntry({
          name: data.name,
          country: data.country
        })
        
        reset()
      } else {
        const errorData = await response.json()
        if (response.status === 409) {
          toast.error('You have already entered the lucky draw.')
        } else {
          throw new Error('Failed to submit entry')
        }
      }
    } catch (error) {
      toast.error('Failed to submit entry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Good Luck! 🎉</h2>
                <p className="text-gray-600 mb-6">
                  Your lucky draw entry has been submitted successfully! The winner will be announced 
                  on our website and contacted directly via email.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Next Steps:</strong> Follow us on social media and check your email 
                    regularly for the winner announcement.
                  </p>
                </div>
                <Link href="/">
                  <Button>Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Study Abroad Lucky Draw</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enter for a chance to win free consultation services and scholarship assistance! 
            One lucky winner will receive comprehensive support for their study abroad journey.
          </p>
          {isActive && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Contest Active
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prize Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>🏆 Grand Prize</CardTitle>
                <CardDescription>
                  What the lucky winner receives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Free Consultation</p>
                      <p className="text-sm text-gray-600">Complete visa and admission guidance</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Application Assistance</p>
                      <p className="text-sm text-gray-600">Help with 3 university applications</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Scholarship Search</p>
                      <p className="text-sm text-gray-600">Personalized scholarship matching</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">4</span>
                    </div>
                    <div>
                      <p className="font-medium">Document Review</p>
                      <p className="text-sm text-gray-600">Professional review of all documents</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Total Value:</strong> $2,000 USD
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contest Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">Entry Period</p>
                      <p className="text-gray-600">Until December 31, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">Winner Announcement</p>
                      <p className="text-gray-600">January 15, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">Winner Contact</p>
                      <p className="text-gray-600">Within 7 days of announcement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lucky Draw Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Enter the Lucky Draw</CardTitle>
                <CardDescription>
                  Fill out the form below for a chance to win the grand prize
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isActive && (
                  <Alert className="mb-6">
                    <AlertDescription>
                      The lucky draw contest is currently not active. Please check back later for upcoming contests.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="John Doe"
                        disabled={!isActive}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="john@example.com"
                        disabled={!isActive}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="+1-234-567-8900"
                        disabled={!isActive}
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select 
                        value={selectedCountry} 
                        onValueChange={(value) => setValue('country', value)}
                        disabled={!isActive}
                      >
                        <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && (
                        <p className="text-sm text-red-500">{errors.country.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">
                      Why do you want to study abroad? *
                    </Label>
                    <Textarea
                      id="reason"
                      {...register('reason')}
                      placeholder="Tell us about your study abroad goals, dream destination, career aspirations, and how this prize would help you achieve your dreams..."
                      rows={6}
                      disabled={!isActive}
                      className={errors.reason ? 'border-red-500' : ''}
                    />
                    {errors.reason && (
                      <p className="text-sm text-red-500">{errors.reason.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Minimum 20 characters. Be creative and share your story!
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Contest Rules:</strong> One entry per person. The winner will be selected 
                      randomly and contacted via email. The prize is non-transferable and must be 
                      claimed within 30 days of announcement.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!isActive || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Entry...
                      </>
                    ) : (
                      'Enter Lucky Draw 🎉'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}