'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { RevenueStatsCard, CropStatsCard, CarbonStatsCard, InsuranceStatsCard } from '@/components/dashboard/StatsCard'
import { CropPriceChart } from '@/components/dashboard/CropPriceChart'
import { SupplyChainTimeline } from '@/components/supply-chain/Timeline'
import { QRScanner } from '@/components/qr/QRScanner'
import { Marketplace } from '@/components/marketplace/Marketplace'
import { LoanApplication } from '@/components/loans/LoanApplication'
import { InsuranceClaims } from '@/components/insurance/InsuranceClaims'
import { FarmerProfile } from '@/components/farmer/FarmerProfile'
import { WeatherWidget } from '@/components/weather/WeatherWidget'
import { Badge } from '@/components/ui/Badge'
import { ConnectionStatusIndicator } from '@/components/common/ConnectionStatus'
import { useLanguage } from '@/contexts/LanguageContext'
import { useApiConnection } from '@/hooks/useApiConnection'
import { farmerProfileApi, yieldTokenApi, insuranceApi, marketplaceApi } from '@/services/api'
import { 
  QrCode, 
  TrendingUp, 
  Leaf, 
  Shield, 
  Truck, 
  IndianRupee,
  Smartphone,
  Globe,
  Zap
} from 'lucide-react'

export default function HomePage() {
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [notification, setNotification] = useState<string | null>(null)
  const { t } = useLanguage()
  const { isConnected, backendStatus } = useApiConnection()

  // Load data from backend when connected
  useEffect(() => {
    if (isConnected) {
      // Load initial data from backend
      loadBackendData()
    }
  }, [isConnected])

  const loadBackendData = async () => {
    try {
      // Load farmer profile
      const profileResponse = await farmerProfileApi.get()
      if (profileResponse.success) {
        console.log('Farmer profile loaded:', profileResponse.data)
      }

      // Load yield tokens
      const tokensResponse = await yieldTokenApi.list()
      if (tokensResponse.success) {
        console.log('Yield tokens loaded:', tokensResponse.data)
      }

      // Load insurance policies
      const policiesResponse = await insuranceApi.getPolicies()
      if (policiesResponse.success) {
        console.log('Insurance policies loaded:', policiesResponse.data)
      }

      // Load marketplace listings
      const listingsResponse = await marketplaceApi.getListings()
      if (listingsResponse.success) {
        console.log('Marketplace listings loaded:', listingsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load backend data:', error)
    }
  }

  // Mock data for charts and timeline
  const priceData = [
    { date: 'Apr 1', price: 2800, predicted: 2850 },
    { date: 'Apr 5', price: 2900, predicted: 2920 },
    { date: 'Apr 10', price: 2950, predicted: 3000 },
    { date: 'Apr 15', price: 3100, predicted: 3150 },
    { date: 'Apr 20', price: 3200, predicted: 3250 },
    { date: 'Apr 25', price: 3350, predicted: 3400 },
    { date: 'Apr 30', price: 3450, predicted: 3500 },
  ]

  const timelineEvents = [
    {
      id: '1',
      title: 'Crop Harvested',
      description: 'Premium quality wheat harvested using sustainable practices',
      timestamp: '2 days ago',
      location: 'Punjab, India',
      status: 'completed' as const,
      metadata: {
        temperature: 22,
        humidity: 65,
        quality: 'Premium',
        verified: true
      }
    },
    {
      id: '2',
      title: 'Quality Verification',
      description: 'AI-powered quality assessment completed',
      timestamp: '1 day ago',
      location: 'Quality Lab, Mumbai',
      status: 'completed' as const,
      metadata: {
        quality: 'Premium',
        verified: true
      }
    },
    {
      id: '3',
      title: 'Tokenization',
      description: 'Yield tokens minted on blockchain',
      timestamp: '12 hours ago',
      location: 'Digital Wallet',
      status: 'completed' as const,
      metadata: {
        verified: true
      }
    },
    {
      id: '4',
      title: 'In Transit',
      description: 'Shipment en route to distribution center',
      timestamp: 'Now',
      location: 'Delhi Distribution Center',
      status: 'in-progress' as const,
      metadata: {
        temperature: 18,
        humidity: 70
      }
    }
  ]

  const handleQRScan = (data: string) => {
    console.log('QR Scanned:', data)
    // Process QR data - could be crop ID, batch number, etc.
    if (data.includes('KS-')) {
      // It's a batch ID, show supply chain details
      setActiveSection('supply-chain')
    } else if (data.includes('FARMER-')) {
      // It's a farmer ID, show profile
      setActiveSection('profile')
    } else {
      // Generic scan, show notification
      alert(`QR Code Scanned: ${data}\n\nProcessing scan data...`)
    }
    setShowQRScanner(false)
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleSectionNavigation = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = 100 // Account for fixed header
      const elementPosition = element.offsetTop - headerHeight
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
    setActiveSection(sectionId)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Header />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span className="font-medium">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Dashboard Section */}
      <section id="dashboard" className="container mx-auto px-6 pt-32 pb-8 scroll-mt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-4">
            Welcome to KrishiSutra
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            National Digital Agriculture Platform - Empowering Farmers with Technology
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="gov-badge">
              <Shield className="w-3 h-3" />
              <span>Blockchain Secured</span>
            </div>
            <div className="gov-badge">
              <Smartphone className="w-3 h-3" />
              <span>PWA Ready</span>
            </div>
            <div className="gov-badge">
              <Leaf className="w-3 h-3" />
              <span>Carbon Credits</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <button
            onClick={() => setShowQRScanner(true)}
            className="gov-button-primary h-auto p-4 flex flex-col items-center space-y-2"
          >
            <QrCode className="w-8 h-8 text-white" />
            <span className="text-sm text-white">Scan QR</span>
          </button>
          <button
            className="gov-button-secondary h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => handleSectionNavigation('loans')}
          >
            <IndianRupee className="w-8 h-8 text-emerald-600" />
            <span className="text-sm text-emerald-600">Get Loan</span>
          </button>
          <button
            className="gov-button-primary h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => handleSectionNavigation('marketplace')}
          >
            <TrendingUp className="w-8 h-8 text-white" />
            <span className="text-sm text-white">Market</span>
          </button>
          <button
            className="gov-button-secondary h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => handleSectionNavigation('insurance')}
          >
            <Shield className="w-8 h-8 text-emerald-600" />
            <span className="text-sm text-emerald-600">Insurance</span>
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div 
            className="gov-stat-card cursor-pointer"
            onClick={() => {
              alert('Revenue Details:\n\nTotal Revenue: ₹28,50,000\nMonthly Growth: +12.5%\nSource: Crop Sales + Carbon Credits\n\nView detailed revenue reports in the Analytics section.')
            }}
          >
            <RevenueStatsCard revenue={2850000} change={12.5} />
          </div>
          <div 
            className="gov-stat-card cursor-pointer"
            onClick={() => {
              alert('Crop Portfolio:\n\nActive Crops: 47\nSeason Growth: +8%\nCrops: Wheat, Rice, Pulses\n\nView detailed crop management in the Dashboard.')
            }}
          >
            <CropStatsCard crops={47} change={8} />
          </div>
          <div 
            className="gov-stat-card cursor-pointer"
            onClick={() => {
              alert('Carbon Credits:\n\nTotal Credits: 1,250\nEarned This Month: +15\nValue: ₹125 per credit\n\nTrade credits in the Marketplace!')
            }}
          >
            <CarbonStatsCard credits={1250} change={15} />
          </div>
          <div 
            className="gov-stat-card cursor-pointer"
            onClick={() => {
              alert('Insurance Coverage:\n\nActive Coverage: ₹5,00,000\nStatus: Active\nPolicies: 2 Active\n\nManage policies in the Insurance section.')
            }}
          >
            <InsuranceStatsCard coverage={500000} active={true} />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <CropPriceChart
              data={priceData}
              cropName="Premium Wheat"
              currentPrice={3450}
              priceChange={12.5}
            />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-accent-gold" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => {
                  handleSectionNavigation('supply-chain')
                  showNotification && showNotification('Opening Tokenization Center...')
                }}>
                  <Leaf className="w-4 h-4 mr-2" />
                  Tokenize Crop
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => {
                  handleSectionNavigation('supply-chain')
                }}>
                  <Truck className="w-4 h-4 mr-2" />
                  Track Shipment
                </Button>
                <Button variant="accent" className="w-full justify-start" onClick={() => {
                  handleSectionNavigation('marketplace')
                }}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Market
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-primary-green" />
                  <span>Global Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary-slate-600">Farmers Connected</span>
                    <span className="font-semibold">12,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary-slate-600">Carbon Offset</span>
                    <span className="font-semibold">2.5M tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary-slate-600">Loans Disbursed</span>
                    <span className="font-semibold">₹450Cr</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Supply Chain Section */}
        <section id="supply-chain" className="mt-8 scroll-mt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="gov-card p-8"
          >
            <SupplyChainTimeline
              events={timelineEvents}
              batchId="KS-2024-05-001"
              cropType="Premium Wheat"
            />
          </motion.div>
        </section>

        {/* Marketplace Section */}
        <section id="marketplace" className="mt-8 scroll-mt-32">
          <div className="gov-card p-8">
            <Marketplace />
          </div>
        </section>

        {/* Loans Section */}
        <section id="loans" className="mt-8 scroll-mt-32">
          <div className="gov-card p-8">
            <LoanApplication />
          </div>
        </section>

        {/* Insurance Section */}
        <section id="insurance" className="mt-8 scroll-mt-32">
          <div className="gov-card p-8">
            <InsuranceClaims />
          </div>
        </section>

        {/* Profile Section */}
        <section id="profile" className="mt-8 scroll-mt-32">
          <div className="gov-card p-8">
            <FarmerProfile />
          </div>
        </section>

        {/* Weather Section */}
        <section id="weather" className="mt-8 scroll-mt-32">
          <div className="gov-card p-8">
            <WeatherWidget />
          </div>
        </section>

        {/* Section Navigation */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className="gov-card p-3 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'marketplace', label: 'Market', icon: '🛒' },
              { id: 'loans', label: 'Loans', icon: '💰' },
              { id: 'insurance', label: 'Insurance', icon: '🛡️' },
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'weather', label: 'Weather', icon: '🌤️' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionNavigation(section.id)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={section.label}
              >
                <span className="text-xl">{section.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Connection Status Indicator */}
      <ConnectionStatusIndicator />
    </div>
  )
}
