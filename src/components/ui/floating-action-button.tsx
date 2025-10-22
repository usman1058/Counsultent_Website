'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUp, MessageCircle, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FloatingActionButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const openWhatsApp = () => {
    window.open('https://wa.me/1234567890', '_blank')
  }

  const openPhone = () => {
    window.open('tel:+1234567890')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2"
        >
          {/* Action buttons */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col space-y-2 mb-2"
              >
                <Button
                  onClick={openWhatsApp}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={openPhone}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main FAB */}
          <div className="flex space-x-2">
            <Button
              onClick={scrollToTop}
              size="sm"
              className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}