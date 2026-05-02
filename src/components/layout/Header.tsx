'use client'

import React, { useState } from 'react'
import { Menu, X, Sun, Moon, Globe, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

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
            <a href="#dashboard" className="text-secondary-slate-700 hover:text-primary-green transition-colors">Dashboard</a>
            <a href="#supply-chain" className="text-secondary-slate-700 hover:text-primary-green transition-colors">Supply Chain</a>
            <a href="#marketplace" className="text-secondary-slate-700 hover:text-primary-green transition-colors">Marketplace</a>
            <a href="#loans" className="text-secondary-slate-700 hover:text-primary-green transition-colors">Loans</a>
            <a href="#insurance" className="text-secondary-slate-700 hover:text-primary-green transition-colors">Insurance</a>
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
              onClick={toggleDarkMode}
              className="p-2"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Button variant="ghost" size="sm" className="p-2">
              <Globe className="w-5 h-5" />
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
              <a href="#dashboard" className="text-secondary-slate-700 hover:text-primary-green transition-colors py-2">Dashboard</a>
              <a href="#supply-chain" className="text-secondary-slate-700 hover:text-primary-green transition-colors py-2">Supply Chain</a>
              <a href="#marketplace" className="text-secondary-slate-700 hover:text-primary-green transition-colors py-2">Marketplace</a>
              <a href="#loans" className="text-secondary-slate-700 hover:text-primary-green transition-colors py-2">Loans</a>
              <a href="#insurance" className="text-secondary-slate-700 hover:text-primary-green transition-colors py-2">Insurance</a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
