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
import { Loader2, Mail, Phone, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Navbar from '@/components/navbar'
import { useSocket } from '@/hooks/use-socket'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  purpose: z.enum(['Study Visa', 'Admission Help', 'Scholarship', 'General'] as const, {
    message: 'Please select a purpose of inquiry'
  }),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { notifyContactSubmission } = useSocket()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  })

  const selectedPurpose = watch('purpose')

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Your message has been sent successfully! We will contact you soon.')
        setIsSubmitted(true)
        
        // Send real-time notification to admin
        notifyContactSubmission({
          name: data.name,
          email: data.email,
          purpose: data.purpose
        })
        
        reset()
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
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
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for contacting us. We have received your message and will get back to you within 24 hours.
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about studying abroad? We're here to help! Fill out the form below 
            and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Reach out to us through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-600">team@studyabroadwithhadi.info</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-gray-600">+92-315-9704384</p>
                    <p className="text-sm text-gray-600">+92-328-4238786</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-gray-600">
                      Office # 3, 4th Floor <br />
                      Shan Arcade Plaza <br />
                      Barkat Market, Garden Town<br />
                      Lahore, Pakistan
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-gray-900 dark:border-gray-800 transition-all hover:shadow-md">
  <div className="p-2 rounded-xl bg-primary/10 text-primary">
    <Mail className="w-6 h-6" />
  </div>

  <div className="space-y-2">
    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
      Community & Groups
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Connect with like-minded people and stay updated through our WhatsApp community.
    </p>

    <div className="flex flex-wrap gap-3 pt-1">
      <a
        href="https://chat.whatsapp.com/Icvo2g7q7FMJOUpCoEKY4w?mode=wwt"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 16 16"
          className="w-4 h-4"
        >
          <path d="M13.601 2.326A7.936 7.936 0 0 0 8.002 0a7.942 7.942 0 0 0-7.99 7.942c0 1.401.37 2.77 1.075 3.977L0 16l4.22-1.11A7.915 7.915 0 0 0 8 15.884h.002a7.946 7.946 0 0 0 7.992-7.941 7.9 7.9 0 0 0-2.393-5.617zM8.002 14.48h-.002a6.54 6.54 0 0 1-3.326-.91l-.238-.14-2.504.658.667-2.44-.155-.25A6.516 6.516 0 0 1 1.462 7.94a6.48 6.48 0 0 1 6.54-6.482 6.48 6.48 0 0 1 6.537 6.482 6.484 6.484 0 0 1-6.537 6.54zm3.66-4.87c-.201-.1-1.187-.586-1.37-.65-.183-.068-.316-.1-.45.1-.134.2-.516.65-.632.785-.116.133-.234.15-.435.05-.2-.1-.846-.312-1.61-.995-.595-.53-.995-1.18-1.113-1.38-.116-.2-.012-.3.087-.4.09-.09.2-.234.3-.35.1-.117.134-.2.2-.334.066-.133.033-.25-.017-.35-.05-.1-.45-1.08-.616-1.48-.163-.392-.328-.34-.45-.35-.116-.008-.25-.01-.384-.01a.74.74 0 0 0-.534.25c-.184.2-.7.683-.7 1.67s.717 1.94.816 2.08c.1.133 1.412 2.2 3.416 3.08.478.205.85.327 1.14.418.478.152.913.13 1.257.08.383-.058 1.187-.48 1.354-.944.167-.467.167-.867.116-.947-.05-.08-.183-.133-.384-.234z" />
        </svg>
        Join WhatsApp Group
      </a>

      <a
        href="https://whatsapp.com/channel/0029VawOpwNFsn0XfoWbgO2H"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 16 16"
          className="w-4 h-4"
        >
          <path d="M13.601 2.326A7.936 7.936 0 0 0 8.002 0a7.942 7.942 0 0 0-7.99 7.942c0 1.401.37 2.77 1.075 3.977L0 16l4.22-1.11A7.915 7.915 0 0 0 8 15.884h.002a7.946 7.946 0 0 0 7.992-7.941 7.9 7.9 0 0 0-2.393-5.617zM8.002 14.48h-.002a6.54 6.54 0 0 1-3.326-.91l-.238-.14-2.504.658.667-2.44-.155-.25A6.516 6.516 0 0 1 1.462 7.94a6.48 6.48 0 0 1 6.54-6.482 6.48 6.48 0 0 1 6.537 6.482 6.484 6.484 0 0 1-6.537 6.54zm3.66-4.87c-.201-.1-1.187-.586-1.37-.65-.183-.068-.316-.1-.45.1-.134.2-.516.65-.632.785-.116.133-.234.15-.435.05-.2-.1-.846-.312-1.61-.995-.595-.53-.995-1.18-1.113-1.38-.116-.2-.012-.3.087-.4.09-.09.2-.234.3-.35.1-.117.134-.2.2-.334.066-.133.033-.25-.017-.35-.05-.1-.45-1.08-.616-1.48-.163-.392-.328-.34-.45-.35-.116-.008-.25-.01-.384-.01a.74.74 0 0 0-.534.25c-.184.2-.7.683-.7 1.67s.717 1.94.816 2.08c.1.133 1.412 2.2 3.416 3.08.478.205.85.327 1.14.418.478.152.913.13 1.257.08.383-.058 1.187-.48 1.354-.944.167-.467.167-.867.116-.947-.05-.08-.183-.133-.384-.234z" />
        </svg>
        Join WhatsApp Channel
      </a>
    </div>
  </div>
</div>

              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Email inquiries:</span>
                    <span className="font-medium">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone calls:</span>
                    <span className="font-medium">Immediate (business hours)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consultation booking:</span>
                    <span className="font-medium">Within 48 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll respond as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
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
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="john@example.com"
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
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose of Inquiry *</Label>
                      <Select 
                        value={selectedPurpose} 
                        onValueChange={(value) => setValue('purpose', value as any)}
                      >
                        <SelectTrigger className={errors.purpose ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Study Visa">Study Visa</SelectItem>
                          <SelectItem value="Admission Help">Admission Help</SelectItem>
                          <SelectItem value="Scholarship">Scholarship</SelectItem>
                          <SelectItem value="General">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.purpose && (
                        <p className="text-sm text-red-500">{errors.purpose.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      {...register('message')}
                      placeholder="Tell us about your study abroad goals, questions, or how we can help you..."
                      rows={6}
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      'Send Message'
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