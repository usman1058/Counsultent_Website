'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
}

interface ContactSubmission {
  id: string
  name: string
  email: string
  purpose: string
  timestamp: string
}

interface LuckyDrawEntry {
  id: string
  name: string
  country: string
  timestamp: string
}

export function useSocket(room?: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [participantCount, setParticipantCount] = useState(0)
  const [newContacts, setNewContacts] = useState<ContactSubmission[]>([])
  const [newLuckyDrawEntries, setNewLuckyDrawEntries] = useState<LuckyDrawEntry[]>([])

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
      
      // Join room if specified
      if (room) {
        socketInstance.emit('join-room', room)
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    // Listen for notifications
    socketInstance.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 10)) // Keep only last 10
    })

    // Listen for participant count updates
    socketInstance.on('participant-count-updated', (data: { count: number; timestamp: string }) => {
      setParticipantCount(data.count)
    })

    // Listen for new contact submissions (admin only)
    socketInstance.on('new-contact', (contact: ContactSubmission) => {
      setNewContacts(prev => [contact, ...prev].slice(0, 5))
    })

    // Listen for new lucky draw entries (admin only)
    socketInstance.on('new-lucky-draw-entry', (entry: LuckyDrawEntry) => {
      setNewLuckyDrawEntries(prev => [entry, ...prev].slice(0, 5))
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [room])

  const sendNotification = (notification: {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    room?: string
  }) => {
    if (socket) {
      socket.emit('send-notification', notification)
    }
  }

  const notifyContactSubmission = (data: {
    name: string
    email: string
    purpose: string
  }) => {
    if (socket) {
      socket.emit('contact-submitted', data)
    }
  }

  const notifyLuckyDrawEntry = (data: {
    name: string
    country: string
  }) => {
    if (socket) {
      socket.emit('lucky-draw-entry', data)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const clearNewContacts = () => {
    setNewContacts([])
  }

  const clearNewLuckyDrawEntries = () => {
    setNewLuckyDrawEntries([])
  }

  return {
    socket,
    connected,
    notifications,
    participantCount,
    newContacts,
    newLuckyDrawEntries,
    sendNotification,
    notifyContactSubmission,
    notifyLuckyDrawEntry,
    clearNotifications,
    clearNewContacts,
    clearNewLuckyDrawEntries
  }
}