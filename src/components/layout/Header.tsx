'use client'

import React, { useState } from 'react'
import { Menu, X, Sun, Moon, Globe, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 glassmorphism border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-primary-green to-primary-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-green">KrishiSutra</h1>
              <p className="text-xs text-secondary-slate-600">Agri-Financing & Supply Chain</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#dashboard" className="text-secondary-slate-700 hover:text-primary-green transition-colors">{t('nav.dashboard')}</a>
            <a href="#supply-chain" className="text-secondary-slate-700 hover:text-primary-green transition-colors">{t('nav.supplyChain')}</a>
            <a href="#marketplace" className="text-secondary-slate-700 hover:text-primary-green transition-colors">{t('nav.marketplace')}</a>
            <a href="#loans" className="text-secondary-slate-700 hover:text-primary-green transition-colors">{t('nav.loans')}</a>
            <a href="#insurance" className="text-secondary-slate-700 hover:text-primary-green transition-colors">{t('nav.insurance')}</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <Badge variant="success" className="hidden sm:flex">
              <Smartphone className="w-3 h-3 mr-1" />
              PWA Ready
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

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
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 py-4 border-t border-white/20">
            <div className="flex flex-col space-y-3">
              <a href="#dashboard" className="text-secondary-slate-700 hover:text-primary-green transition-colors py-2">{t('nav.dashboard')}</a>
              <a href="#supply-chain" className="text-secondary-slate-700 hover:text-primary-green transition-colors py-2">{t('nav.supplyChain')}</a>
              <a href="#marketplace" className="text-secondary-slate-700 hover:text-primary-green transition-colors py-2">{t('nav.marketplace')}</a>
              <a href="#loans" className="text-secondary-slate-700 hover:text-primary-green transition-colors py-2">{t('nav.loans')}</a>
              <a href="#insurance" className="text-secondary-slate-700 hover:text-primary-green transition-colors py-2">{t('nav.insurance')}</a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
