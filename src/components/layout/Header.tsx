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
        installInstructions = `� Development Mode - PWA Install Simulation

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
        background: var(--cyber-dark);
        border: 2px solid var(--cyber-emerald);
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        color: var(--cyber-emerald);
        font-family: 'Inter', sans-serif;
        white-space: pre-line;
        box-shadow: 0 0 20px var(--cyber-emerald);
      `
      
      content.textContent = installInstructions
      
      const closeBtn = document.createElement('button')
      closeBtn.textContent = 'Close'
      closeBtn.style.cssText = `
        background: var(--cyber-emerald);
        color: var(--cyber-dark);
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
    <header 
      className="fixed top-0 left-0 right-0 bg-cyber-dark border-b-2 border-cyber-emerald shadow-2xl"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'var(--cyber-dark)',
        borderBottom: '2px solid var(--cyber-emerald)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyber-emerald to-cyber-neon flex items-center justify-center cyber-emerald-glow">
              <span className="text-black font-bold text-xl tracking-wider">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary text-emerald tracking-wider">KRISHISUTRA</h1>
              <p className="text-xs text-secondary text-neon tracking-wider">AGRI-FINTECH SYSTEM</p>
            </div>
          </div>

          {/* Center Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2 z-10">
            <button 
              onClick={(e) => handleNavClick(e, 'dashboard')}
              className="text-secondary hover:text-emerald transition-colors font-bold tracking-wider text-sm px-3 py-2 rounded hover:bg-frosted-cyber bg-transparent border-none cursor-pointer"
            >
              {t('nav.dashboard')}
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'supply-chain')}
              className="text-secondary hover:text-emerald-accent transition-colors font-bold tracking-wider text-sm px-3 py-2 rounded hover:bg-frosted-cyber bg-transparent border-none cursor-pointer"
            >
              {t('nav.supplyChain')}
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'marketplace')}
              className="text-secondary hover:text-emerald-light transition-colors font-bold tracking-wider text-sm px-3 py-2 rounded hover:bg-frosted-cyber bg-transparent border-none cursor-pointer"
            >
              {t('nav.marketplace')}
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'loans')}
              className="text-secondary hover:text-gold transition-colors font-bold tracking-wider text-sm px-3 py-2 rounded hover:bg-frosted-cyber bg-transparent border-none cursor-pointer"
            >
              {t('nav.loans')}
            </button>
            <button 
              onClick={(e) => handleNavClick(e, 'insurance')}
              className="text-secondary hover:text-neon transition-colors font-bold tracking-wider text-sm px-3 py-2 rounded hover:bg-frosted-cyber bg-transparent border-none cursor-pointer"
            >
              {t('nav.insurance')}
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={handlePWAInstall}
              className="hidden sm:flex bg-emerald-accent text-cyber-dark border border-emerald-accent rounded-full px-3 py-1 text-xs font-bold transition-all duration-200 hover:bg-emerald-light hover:border-emerald-light cursor-pointer animate-pulse"
            >
              <Download className="w-3 h-3 mr-1" />
              Install App
            </button>

            <Button variant="ghost" size="sm" className="p-2 relative">
              <Globe className="w-5 h-5" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="pa">PA</option>
                <option value="bn">BN</option>
                <option value="te">TE</option>
                <option value="mr">MR</option>
                <option value="gu">GU</option>
                <option value="ta">TA</option>
                <option value="kn">KN</option>
                <option value="ml">ML</option>
              </select>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="lg:hidden p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 py-4 border-t border-white/20">
            <div className="flex flex-col space-y-2">
              <button 
                onClick={(e) => handleNavClick(e, 'dashboard')}
                className="text-secondary hover:text-emerald transition-colors font-bold tracking-wider text-sm py-2 px-3 rounded hover:bg-frosted-cyber bg-transparent border-none cursor-pointer text-left"
              >
                {t('nav.dashboard')}
              </button>
              <button 
                onClick={(e) => handleNavClick(e, 'supply-chain')}
                className="text-secondary hover:text-emerald-accent transition-colors font-bold tracking-wider text-sm py-2 px-3 rounded hover:bg-frosted-cyber bg-transparent border-none cursor-pointer text-left"
              >
                {t('nav.supplyChain')}
              </button>
              <button 
                onClick={(e) => handleNavClick(e, 'marketplace')}
                className="text-secondary hover:text-emerald-light transition-colors font-bold tracking-wider text-sm py-2 px-3 rounded hover:bg-frosted-cyber bg-transparent border-none cursor-pointer text-left"
              >
                {t('nav.marketplace')}
              </button>
              <button 
                onClick={(e) => handleNavClick(e, 'loans')}
                className="text-secondary hover:text-gold transition-colors font-bold tracking-wider text-sm py-2 px-3 rounded hover:bg-frosted-cyber bg-transparent border-none cursor-pointer text-left"
              >
                {t('nav.loans')}
              </button>
              <button 
                onClick={(e) => handleNavClick(e, 'insurance')}
                className="text-secondary hover:text-neon transition-colors font-bold tracking-wider text-sm py-2 px-3 rounded hover:bg-frosted-cyber bg-transparent border-none cursor-pointer text-left"
              >
                {t('nav.insurance')}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
