'use client'

import React, { useState } from 'react'
import { Menu, X, Globe, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useLanguage } from '@/contexts/LanguageContext'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] glassmorphism border-b border-white/20">
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
            <Badge variant="success" className="hidden sm:flex">
              <Smartphone className="w-3 h-3 mr-1" />
              PWA Ready
            </Badge>

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
