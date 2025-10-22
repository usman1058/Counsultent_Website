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
import { Loader2, Handshake, Mail, Phone, Globe, Building } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Navbar from '@/components/navbar'

const b2bSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Please select or enter a country'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type B2BFormData = z.infer<typeof b2bSchema>

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
  'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Switzerland', 'Austria', 'Belgium', 'Ireland', 'Portugal', 'Greece',
  'India', 'China', 'Japan', 'South Korea', 'Singapore', 'Malaysia',
  'UAE', 'Saudi Arabia', 'Israel', 'Turkey', 'Egypt', 'South Africa',
  'Brazil', 'Argentina', 'Mexico', 'Chile', 'Colombia', 'Peru',
  'New Zealand', 'Others'
]

export default function B2BPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<B2BFormData>({
    resolver: zodResolver(b2bSchema)
  })

  const selectedCountry = watch('country')

  const onSubmit = async (data: B2BFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/b2b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Your partnership inquiry has been sent successfully! We will contact you soon.')
        setIsSubmitted(true)
        reset()
      } else {
        throw new Error('Failed to send inquiry')
      }
    } catch (error) {
      toast.error('Failed to send inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Partnership Inquiry Sent!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your interest in partnering with us. We have received your inquiry 
                  and our business development team will contact you within 48 hours.
                </p>
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Partner With Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our network of educational partners and help students achieve their study abroad dreams. 
            We collaborate with universities, agents, and organizations worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Partnership Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Why Partner With Us?</CardTitle>
                <CardDescription>
                  Join our growing network of trusted partners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Global Reach</p>
                    <p className="text-sm text-gray-600">
                      Connect with students from over 50 countries looking to study abroad
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Building className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Quality Network</p>
                    <p className="text-sm text-gray-600">
                      Join a curated network of reputable institutions and service providers
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Handshake className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Mutual Growth</p>
                    <p className="text-sm text-gray-600">
                      Benefit from shared resources, referrals, and collaborative opportunities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Partnership Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Educational Institutions</p>
                    <p className="text-gray-600">Universities, colleges, and schools</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Education Agents</p>
                    <p className="text-gray-600">Recruitment agencies and consultants</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Service Providers</p>
                    <p className="text-gray-600">Accommodation, insurance, and support services</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Government Organizations</p>
                    <p className="text-gray-600">Educational bodies and cultural exchanges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* B2B Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Partnership Inquiry</CardTitle>
                <CardDescription>
                  Tell us about your organization and how we can work together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="John Doe"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Organization/Company Name *</Label>
                      <Input
                        id="company"
                        {...register('company')}
                        placeholder="ABC Education Group"
                        className={errors.company ? 'border-red-500' : ''}
                      />
                      {errors.company && (
                        <p className="text-sm text-red-500">{errors.company.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="john@company.com"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="+1-234-567-8900"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select 
                      value={selectedCountry} 
                      onValueChange={(value) => setValue('country', value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="message">Message/Proposal *</Label>
                    <Textarea
                      id="message"
                      {...register('message')}
                      placeholder="Tell us about your organization, what type of partnership you're looking for, and how we can collaborate..."
                      rows={6}
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500">{errors.message.message}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Next Steps:</strong> After receiving your inquiry, our business development team 
                      will review your proposal and contact you within 48 hours to discuss potential collaboration opportunities.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Inquiry...
                      </>
                    ) : (
                      'Send Partnership Inquiry'
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