'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe, Smartphone, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useLanguage } from '@/contexts/LanguageContext'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>, sectionId: string) => {
    e.preventDefault()
    console.log('Navigation clicked:', sectionId)
    const element = document.getElementById(sectionId)
    console.log('Element found:', element)
    if (element) {
      const headerHeight = 100 // Fixed header height
      const elementPosition = element.offsetTop - headerHeight
      console.log('Scrolling to position:', elementPosition)
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    } else {
      console.log('Element not found for ID:', sectionId)
    }
    setIsMenuOpen(false)
  }

  useEffect(() => {
    // Listen for PWA install prompt (works in production)
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('PWA install prompt detected')
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Check if running on localhost
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('local')

    // Simulate install prompt on localhost for development
    if (isLocalhost) {
      console.log('Development mode: Simulating PWA install availability')
      setShowInstallPrompt(true)
    } else {
      // Production: Listen for real install prompt
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }

    return () => {
      if (!isLocalhost) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }
  }, [])

  const handlePWAInstall = async () => {
    console.log('PWA install clicked')
    
    if (deferredPrompt) {
      // Use the deferred prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA install outcome:', outcome)
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted')
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      } else {
        console.log('PWA installation dismissed')
      }
    } else {
      // Show comprehensive install modal
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const userAgent = navigator.userAgent.toLowerCase()
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('local')
      
      let installInstructions = ''
      
      if (isStandalone) {
        installInstructions = '🎉 KrishiSutra is already installed as a PWA!'
      } else if (isLocalhost) {
        installInstructions = `🔧 Development Mode - PWA Install Simulation

⚠️ PWA install prompts don't work on localhost!

📱 To Test PWA Installation:

1. Deploy to HTTPS (Vercel, Netlify, etc.)
2. Visit the deployed site
3. Look for install icons in address bar
4. Or use the "Install App" button there

🚀 Quick Deploy Options:
• Vercel: Connect GitHub repo
• Netlify: Drag & drop build folder
• GitHub Pages: Enable in repo settings

✅ What's Already Working:
• Complete PWA manifest
• Service worker registered
• All icon sizes created
• Install button ready for production

📋 Production Checklist:
☐ Deploy to HTTPS
☐ Visit from mobile device
☐ Check for install icon (⬇️) in address bar
☐ Test install process
☐ Verify standalone mode

💡 Note: PWA install prompts require HTTPS and real domain!`
      } else if (userAgent.includes('chrome') || userAgent.includes('edg')) {
        installInstructions = `📱 Install KrishiSutra PWA (Chrome/Edge):

Method 1 - Address Bar:
• Look for install icon (⬇️) in the address bar
• Click it and follow the prompts

Method 2 - Menu:
• Click the three dots (⋮) in the top-right
• Select "Install app" or "Install KrishiSutra"
• Follow the installation prompts

Method 3 - Manual:
• Click the download icon in our header
• Follow the browser prompts

✅ Benefits:
• Works offline
• Faster loading
• Native app experience
• No browser interface`
      } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        installInstructions = `📱 Install KrishiSutra PWA (Safari):

Method 1 - Share Menu:
• Click the Share icon (📤) in the address bar
• Select "Add to Home Screen"
• Follow the installation prompts

Method 2 - Settings:
• Go to Settings > Safari
• Enable "Add to Home Screen"
• Return to the app and try again

✅ Benefits:
• Works offline
• Faster loading
• Native app experience
• No browser interface`
      } else if (userAgent.includes('firefox')) {
        installInstructions = `📱 Install KrishiSutra PWA (Firefox):

Method 1 - Address Bar:
• Look for the install icon (+) in the address bar
• Click it and follow the prompts

Method 2 - Menu:
• Click the three lines (☰) in the top-right
• Select "Install Site"
• Follow the installation prompts

✅ Benefits:
• Works offline
• Faster loading
• Native app experience
• No browser interface`
      } else {
        installInstructions = `📱 Install KrishiSutra PWA:

Chrome/Edge:
• Click ⋮ menu → "Install app"
• Look for install icon in address bar

Safari:
• Click Share → "Add to Home Screen"

Firefox:
• Click ☰ menu → "Install Site"

✅ Benefits:
• Works offline
• Faster loading
• Native app experience`
      }
      
      // Create a modal-like experience
      const modal = document.createElement('div')
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
      `
      
      const content = document.createElement('div')
      content.style.cssText = `
        background: var(--glass-gov-bg);
        border: 2px solid var(--glass-gov-border);
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        color: var(--gov-white);
        font-family: 'Inter', sans-serif;
        white-space: pre-line;
        box-shadow: var(--glass-gov-shadow);
      `
      
      content.textContent = installInstructions
      
      const closeBtn = document.createElement('button')
      closeBtn.textContent = 'Close'
      closeBtn.style.cssText = `
        background: var(--gov-emerald);
        color: var(--gov-white);
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        margin-top: 16px;
        cursor: pointer;
        font-weight: bold;
      `
      
      closeBtn.onclick = () => {
        document.body.removeChild(modal)
      }
      
      content.appendChild(closeBtn)
      modal.appendChild(content)
      document.body.appendChild(modal)
      
      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal)
        }
      }
    }
  }

  return (
    <header className="gov-header">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">KRISHISUTRA</h1>
              <p className="text-xs text-gray-400 tracking-wide uppercase">National Agriculture Platform</p>
            </div>
          </div>

          {/* Center Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button 
              onClick={(e) => handleNavClick(e, 'dashboard')}
              className="text-gray-300 hover:text-emerald-400 transition-colors font-medium text-sm"
            >
              {t('nav.dashboard')}
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'supply-chain')}
              className="text-gray-300 hover:text-emerald-400 transition-colors font-medium text-sm"
            >
              {t('nav.supplyChain')}
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'marketplace')}
              className="text-gray-300 hover:text-emerald-400 transition-colors font-medium text-sm"
            >
              {t('nav.marketplace')}
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'loans')}
              className="text-gray-300 hover:text-emerald-400 transition-colors font-medium text-sm"
            >
              {t('nav.loans')}
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'insurance')}
              className="text-gray-300 hover:text-emerald-400 transition-colors font-medium text-sm"
            >
              {t('nav.insurance')}
            </button>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-600 hover:border-emerald-400 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{language.toUpperCase()}</span>
              </button>
            </div>

            {/* PWA Install Button */}
            {showInstallPrompt && (
              <button 
                onClick={handlePWAInstall}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="w-5 h-5 text-gray-300" /> : <Menu className="w-5 h-5 text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-gray-900 border-t border-gray-700"
            >
              <div className="px-6 py-4 space-y-3">
                <button 
                  onClick={(e) => handleNavClick(e, 'dashboard')}
                  className="block w-full text-left text-gray-300 hover:text-emerald-500 transition-colors font-medium py-2"
                >
                  {t('nav.dashboard')}
                </button>
                <button 
                  onClick={(e) => handleNavClick(e, 'supply-chain')}
                  className="block w-full text-left text-gray-300 hover:text-emerald-500 transition-colors font-medium py-2"
                >
                  {t('nav.supplyChain')}
                </button>
                <button 
                  onClick={(e) => handleNavClick(e, 'marketplace')}
                  className="block w-full text-left text-gray-300 hover:text-emerald-500 transition-colors font-medium py-2"
                >
                  {t('nav.marketplace')}
                </button>
                <button 
                  onClick={(e) => handleNavClick(e, 'loans')}
                  className="block w-full text-left text-gray-300 hover:text-emerald-500 transition-colors font-medium py-2"
                >
                  {t('nav.loans')}
                </button>
                <button 
                  onClick={(e) => handleNavClick(e, 'insurance')}
                  className="block w-full text-left text-gray-300 hover:text-emerald-500 transition-colors font-medium py-2"
                >
                  {t('nav.insurance')}
                </button>
                
                {/* Language Options in Mobile Menu */}
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-3">Select Language</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['en', 'hi', 'pa', 'bn', 'te', 'mr', 'gu', 'ta', 'kn', 'ml'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang as any)}
                        className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                          language === lang
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
