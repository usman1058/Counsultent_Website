'use client'

import { useEffect, useState } from 'react'
import { useSocket } from '@/hooks/use-socket'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  XCircle,
  Users,
  Mail,
  Gift,
  MessageCircle,
  Phone,
  Send,
  ExternalLink,
  Clock,
  Archive,
  Settings,
  Filter,
  MoreVertical
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface RealTimeNotificationsProps {
  isAdmin?: boolean
  room?: string
}

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info' | 'whatsapp' | 'contact' | 'lucky-draw'
  title: string
  message: string
  timestamp: Date
  actionUrl?: string
  actionText?: string
  isRead?: boolean
  priority?: 'low' | 'medium' | 'high'
}

interface ContactNotification {
  id: string
  name: string
  email: string
  phone: string
  purpose: string
  message: string
  timestamp: Date
}

interface LuckyDrawNotification {
  id: string
  name: string
  country: string
  email: string
  timestamp: Date
}

export default function RealTimeNotifications({ isAdmin = false, room }: RealTimeNotificationsProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    enableSound: true,
    enableDesktop: true,
    enableWhatsApp: true,
    autoArchive: false,
    showPriority: true
  })
  const [archivedNotifications, setArchivedNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all')
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null)

  const {
    connected,
    notifications,
    participantCount,
    newContacts,
    newLuckyDrawEntries,
    clearNotifications,
    clearNewContacts,
    clearNewLuckyDrawEntries
  } = useSocket(isAdmin ? 'admin' : room)

  // Enhanced notification functions
  const markAsRead = (id: string) => {
    // This would typically update the backend
    console.log(`Marking notification ${id} as read`)
  }

  const archiveNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id)
    if (notification) {
      setArchivedNotifications(prev => [...prev, { ...notification, isRead: true }])
      // This would typically update the backend
    }
  }

  const sendWhatsAppMessage = (contact: ContactNotification) => {
    const whatsappUrl = `https://wa.me/${contact.phone.replace(/\D/g, '')}?text=Hi ${contact.name}, I received your inquiry about ${contact.purpose}. How can I help you today?`
    window.open(whatsappUrl, '_blank')
    toast.success('Opening WhatsApp to send message')
  }

  const sendWhatsAppGroupMessage = (message: string) => {
    const groupUrl = `https://chat.whatsapp.com/` // Replace with your actual group URL
    window.open(groupUrl, '_blank')
    toast.success('Opening WhatsApp group')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-600" />
      case 'contact':
        return <Mail className="w-4 h-4 text-blue-500" />
      case 'lucky-draw':
        return <Gift className="w-4 h-4 text-purple-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string, priority?: string) => {
    const baseColors = {
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      error: 'border-red-200 bg-red-50',
      info: 'border-blue-200 bg-blue-50',
      whatsapp: 'border-green-300 bg-green-50',
      contact: 'border-blue-300 bg-blue-50',
      'lucky-draw': 'border-purple-300 bg-purple-50'
    }

    if (priority === 'high') {
      return 'border-red-300 bg-red-50 shadow-red-100'
    }
    
    return baseColors[type as keyof typeof baseColors] || baseColors.info
  }

  const getPriorityBadge = (priority?: string) => {
    if (!priority || priority === 'low') return null
    
    const colors = {
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={`text-xs ${colors[priority as keyof typeof colors]}`}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'priority') return notification.priority === 'high'
    return true
  })

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Notifications */}
      <AnimatePresence>
        {filteredNotifications.slice(0, 3).map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`border-l-4 ${getNotificationColor(notification.type, notification.priority)} shadow-lg`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                        {notification.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(notification.actionUrl, '_blank')}
                            className="h-6 px-2 text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {notification.actionText || 'View'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!notification.isRead && (
                        <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => archiveNotification(notification.id)}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        // This would typically update the backend
                        console.log(`Removing notification ${notification.id}`)
                      }}>
                        <X className="w-4 h-4 mr-2" />
                        Dismiss
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Admin-specific notifications */}
      {isAdmin && (
        <AnimatePresence>
          {newContacts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-l-4 border-blue-200 bg-blue-50 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          New Contact Inquiry
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {newContacts[0].name} - {newContacts[0].purpose}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(newContacts[0].timestamp).toLocaleTimeString()}
                          </span>
                          {notificationSettings.enableWhatsApp && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendWhatsAppMessage(newContacts[0])}
                              className="h-7 px-3 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {newContacts.length > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          +{newContacts.length - 1}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => sendWhatsAppMessage(newContacts[0])}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Send WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={clearNewContacts}>
                            <X className="w-4 h-4 mr-2" />
                            Clear All
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {newLuckyDrawEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-l-4 border-yellow-200 bg-yellow-50 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Gift className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          Lucky Draw Entry
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {newLuckyDrawEntries[0].name} from {newLuckyDrawEntries[0].country}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(newLuckyDrawEntries[0].timestamp).toLocaleTimeString()}
                          </span>
                          {notificationSettings.enableWhatsApp && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendWhatsAppMessage({
                                id: newLuckyDrawEntries[0].id,
                                name: newLuckyDrawEntries[0].name,
                                email: newLuckyDrawEntries[0].email,
                                phone: '',
                                purpose: 'lucky-draw',
                                message: '',
                                timestamp: newLuckyDrawEntries[0].timestamp
                              })}
                              className="h-7 px-3 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {newLuckyDrawEntries.length > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          +{newLuckyDrawEntries.length - 1}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => sendWhatsAppMessage({
                            id: newLuckyDrawEntries[0].id,
                            name: newLuckyDrawEntries[0].name,
                            email: newLuckyDrawEntries[0].email,
                            phone: '',
                            purpose: 'lucky-draw',
                            message: '',
                            timestamp: newLuckyDrawEntries[0].timestamp
                          })}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Send WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={clearNewLuckyDrawEntries}>
                            <X className="w-4 h-4 mr-2" />
                            Clear All
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Action buttons */}
      <div className="flex space-x-2">
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-md hover:shadow-lg transition-shadow"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {notifications.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={clearNotifications}>
                  <X className="w-4 h-4 mr-2" />
                  Clear All Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  <Filter className="w-4 h-4 mr-2" />
                  All Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  <Filter className="w-4 h-4 mr-2" />
                  Unread Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('priority')}>
                  <Filter className="w-4 h-4 mr-2" />
                  Priority Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
        
        {isAdmin && notificationSettings.enableWhatsApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 shadow-md hover:shadow-lg transition-shadow"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => sendWhatsAppGroupMessage("New notifications available")}>
                  <Users className="w-4 h-4 mr-2" />
                  Send to Group
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // Send to all new contacts
                  newContacts.forEach(contact => sendWhatsAppMessage(contact))
                }}>
                  <Mail className="w-4 h-4 mr-2" />
                  Message All Contacts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // Send to all lucky draw entries
                  newLuckyDrawEntries.forEach(entry => sendWhatsAppMessage({
                    id: entry.id,
                    name: entry.name,
                    email: entry.email,
                    phone: '',
                    purpose: 'lucky-draw',
                    message: '',
                    timestamp: entry.timestamp
                  }))
                }}>
                  <Gift className="w-4 h-4 mr-2" />
                  Message All Lucky Draw
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSettings(!showSettings)}>
                  <Settings className="w-4 h-4 mr-2" />
                  WhatsApp Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </div>
    </div>
  )
}