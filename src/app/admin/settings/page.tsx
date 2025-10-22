// app/admin/settings/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Palette, Globe, User, Save, Eye, Shield, Navigation, Lock, Key, Plus, Trash2 } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { toast } from 'sonner'

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteUrl: z.string().url('Please enter a valid URL'),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  contactEmail: z.string().email('Please enter a valid email'),
  contactPhone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
  aboutContent: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color'),
  adminName: z.string().min(1, 'Admin name is required'),
  adminEmail: z.string().email('Please enter a valid email'),
  adminPhone: z.string().min(1, 'Admin phone is required'),
  adminTitle: z.string().min(1, 'Admin title is required'),
  adminBio: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { settings, updateSettings, isLoading, colors, updateColors } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [navbarLinks, setNavbarLinks] = useState<Array<{
    id: string
    label: string
    href: string
    isVisible: boolean
    order: number
  }>>([])
  const [isUpdatingNavbar, setIsUpdatingNavbar] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema)
  })

  const watchedColors = watch(['primaryColor', 'secondaryColor', 'accentColor'])

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  // Initialize form with settings
  useEffect(() => {
    if (settings) {
      reset({
        siteName: settings.siteName,
        siteUrl: settings.siteUrl,
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        address: settings.address || '',
        aboutContent: settings.aboutContent || '',
        metaTitle: settings.metaTitle || '',
        metaDescription: settings.metaDescription || '',
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        adminName: settings.adminName,
        adminEmail: settings.adminEmail,
        adminPhone: settings.adminPhone,
        adminTitle: settings.adminTitle,
        adminBio: settings.adminBio || '',
      })
    }
  }, [settings, reset])

  // Update theme colors in real-time
  useEffect(() => {
    if (previewMode) {
      const [primary, secondary, accent] = watchedColors
      if (primary && secondary && accent) {
        updateColors({
          primary,
          secondary,
          accent
        })
      }
    }
  }, [watchedColors, previewMode, updateColors])

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true)
    try {
      // Transform empty strings to null for optional fields
      const transformedData = {
        ...data,
        logoUrl: data.logoUrl || null,
        faviconUrl: data.faviconUrl || null,
        address: data.address || null,
        aboutContent: data.aboutContent || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        adminBio: data.adminBio || null,
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transformedData)
      })

      if (response.ok) {
        const result = await response.json()
        updateSettings(result.settings)
        toast.success('Settings updated successfully!')
        setPreviewMode(false)
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      toast.error('Failed to update settings. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetColors = () => {
    setValue('primaryColor', '#3b82f6')
    setValue('secondaryColor', '#6366f1')
    setValue('accentColor', '#f59e0b')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        toast.success('Password changed successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const fetchNavbarLinks = async () => {
    try {
      const response = await fetch('/api/admin/navbar-links')
      if (response.ok) {
        const data = await response.json()
        setNavbarLinks(data)
      }
    } catch (error) {
      console.error('Failed to fetch navbar links:', error)
    }
  }

  const updateNavbarLinks = async () => {
    setIsUpdatingNavbar(true)
    try {
      const response = await fetch('/api/admin/navbar-links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ links: navbarLinks })
      })

      if (response.ok) {
        toast.success('Navbar links updated successfully!')
      } else {
        toast.error('Failed to update navbar links')
      }
    } catch (error) {
      toast.error('Failed to update navbar links. Please try again.')
    } finally {
      setIsUpdatingNavbar(false)
    }
  }

  const addNavbarLink = () => {
    const newLink = {
      id: Date.now().toString(),
      label: 'New Link',
      href: '#',
      isVisible: true,
      order: navbarLinks.length
    }
    setNavbarLinks([...navbarLinks, newLink])
  }

  const updateNavbarLink = (id: string, updates: Partial<typeof navbarLinks[0]>) => {
    setNavbarLinks(navbarLinks.map(link =>
      link.id === id ? { ...link, ...updates } : link
    ))
  }

  const deleteNavbarLink = (id: string) => {
    setNavbarLinks(navbarLinks.filter(link => link.id !== id))
  }

  useEffect(() => {
    fetchNavbarLinks()
  }, [])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your site settings and appearance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Previewing' : 'Preview'}
          </Button>
        </div>
      </div>

      {previewMode && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            You are in preview mode. Changes to colors will be reflected immediately but won't be saved until you click "Save Changes".
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="admin">Admin Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Site Information
                </CardTitle>
                <CardDescription>
                  Basic information about your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name *</Label>
                    <Input
                      id="siteName"
                      {...register('siteName')}
                      className={errors.siteName ? 'border-red-500' : ''}
                    />
                    {errors.siteName && (
                      <p className="text-sm text-red-500">{errors.siteName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL *</Label>
                    <Input
                      id="siteUrl"
                      {...register('siteUrl')}
                      placeholder="https://studyabroadwithhadi.info"
                      className={errors.siteUrl ? 'border-red-500' : ''}
                    />
                    {errors.siteUrl && (
                      <p className="text-sm text-red-500">{errors.siteUrl.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      {...register('logoUrl')}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl">Favicon URL</Label>
                    <Input
                      id="faviconUrl"
                      {...register('faviconUrl')}
                      placeholder="https://example.com/favicon.ico"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      {...register('contactEmail')}
                      className={errors.contactEmail ? 'border-red-500' : ''}
                    />
                    {errors.contactEmail && (
                      <p className="text-sm text-red-500">{errors.contactEmail.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      {...register('contactPhone')}
                      className={errors.contactPhone ? 'border-red-500' : ''}
                    />
                    {errors.contactPhone && (
                      <p className="text-sm text-red-500">{errors.contactPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...register('address')}
                    placeholder="123 Education Street, Learning City, LC 12345"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutContent">About Content</Label>
                  <Textarea
                    id="aboutContent"
                    {...register('aboutContent')}
                    placeholder="Tell visitors about your consulting services..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Theme Colors
                </CardTitle>
                <CardDescription>
                  Customize the appearance of your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primaryColor"
                        {...register('primaryColor')}
                        placeholder="#3b82f6"
                        className={errors.primaryColor ? 'border-red-500' : ''}
                      />
                      <div
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: watchedColors[0] }}
                      />
                    </div>
                    {errors.primaryColor && (
                      <p className="text-sm text-red-500">{errors.primaryColor.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="secondaryColor"
                        {...register('secondaryColor')}
                        placeholder="#6366f1"
                        className={errors.secondaryColor ? 'border-red-500' : ''}
                      />
                      <div
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: watchedColors[1] }}
                      />
                    </div>
                    {errors.secondaryColor && (
                      <p className="text-sm text-red-500">{errors.secondaryColor.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="accentColor"
                        {...register('accentColor')}
                        placeholder="#f59e0b"
                        className={errors.accentColor ? 'border-red-500' : ''}
                      />
                      <div
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: watchedColors[2] }}
                      />
                    </div>
                    {errors.accentColor && (
                      <p className="text-sm text-red-500">{errors.accentColor.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button type="button" variant="outline" onClick={handleResetColors}>
                    Reset to Default
                  </Button>
                  <div className="text-sm text-gray-500">
                    Default: Blue (#3b82f6), Indigo (#6366f1), Amber (#f59e0b)
                  </div>
                </div>

                {/* Color Preview */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Color Preview</h4>
                  <div className="flex flex-wrap gap-3">
                    <div
                      className="px-4 py-2 rounded text-white text-sm"
                      style={{ backgroundColor: watchedColors[0] }}
                    >
                      Primary
                    </div>
                    <div
                      className="px-4 py-2 rounded text-white text-sm"
                      style={{ backgroundColor: watchedColors[1] }}
                    >
                      Secondary
                    </div>
                    <div
                      className="px-4 py-2 rounded text-white text-sm"
                      style={{ backgroundColor: watchedColors[2] }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Admin Information
                </CardTitle>
                <CardDescription>
                  Your personal information displayed on the website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Your Name *</Label>
                    <Input
                      id="adminName"
                      {...register('adminName')}
                      className={errors.adminName ? 'border-red-500' : ''}
                    />
                    {errors.adminName && (
                      <p className="text-sm text-red-500">{errors.adminName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminTitle">Your Title *</Label>
                    <Input
                      id="adminTitle"
                      {...register('adminTitle')}
                      placeholder="Expert Visa Consultant"
                      className={errors.adminTitle ? 'border-red-500' : ''}
                    />
                    {errors.adminTitle && (
                      <p className="text-sm text-red-500">{errors.adminTitle.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      {...register('adminEmail')}
                      className={errors.adminEmail ? 'border-red-500' : ''}
                    />
                    {errors.adminEmail && (
                      <p className="text-sm text-red-500">{errors.adminEmail.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPhone">Admin Phone *</Label>
                    <Input
                      id="adminPhone"
                      {...register('adminPhone')}
                      className={errors.adminPhone ? 'border-red-500' : ''}
                    />
                    {errors.adminPhone && (
                      <p className="text-sm text-red-500">{errors.adminPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminBio">Professional Bio</Label>
                  <Textarea
                    id="adminBio"
                    {...register('adminBio')}
                    placeholder="Tell visitors about your experience and expertise..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter your new password"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    type="button" // Important: type="button" to prevent form submission
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Security Tips</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Use a strong password with a mix of letters, numbers, and symbols</li>
                    <li>• Don't share your password with anyone</li>
                    <li>• Change your password regularly</li>
                    <li>• Use a unique password for this account</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


            <TabsContent value="navigation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Navigation className="w-5 h-5 mr-2" />
                    Navigation Management
                  </CardTitle>
                  <CardDescription>
                    Manage the links shown in your website navigation bar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Navbar Links</h4>
                    <Button onClick={addNavbarLink} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {navbarLinks.map((link, index) => (
                      <div key={link.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            value={link.label}
                            onChange={(e) => updateNavbarLink(link.id, { label: e.target.value })}
                            placeholder="Link Label"
                          />
                          <Input
                            value={link.href}
                            onChange={(e) => updateNavbarLink(link.id, { href: e.target.value })}
                            placeholder="Link URL"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={link.isVisible}
                              onChange={(e) => updateNavbarLink(link.id, { isVisible: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm">Visible</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateNavbarLink(link.id, { order: Math.max(0, index - 1) })}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateNavbarLink(link.id, { order: Math.min(navbarLinks.length - 1, index + 1) })}
                            disabled={index === navbarLinks.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteNavbarLink(link.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {navbarLinks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Navigation className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No navigation links configured</p>
                      <p className="text-sm">Click "Add Link" to create your first navigation link</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={updateNavbarLinks} disabled={isUpdatingNavbar}>
                      <Save className="w-4 h-4 mr-2" />
                      {isUpdatingNavbar ? 'Updating...' : 'Update Navigation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>
                    Search engine optimization settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      {...register('metaTitle')}
                      placeholder="Study Abroad with Hadi - Visa Consulting & International Education"
                    />
                    <p className="text-sm text-gray-500">
                      Recommended: 50-60 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      {...register('metaDescription')}
                      placeholder="Expert visa consulting services for students looking to study abroad..."
                      rows={3}
                    />
                    <p className="text-sm text-gray-500">
                      Recommended: 150-160 characters
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}