'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
import { useLanguage } from '@/contexts/LanguageContext'
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
  const { t } = useLanguage()

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
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Dashboard Section */}
      <section id="dashboard" className="container mx-auto px-4 pt-24 pb-8 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-emerald mb-4">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-lg text-cyber max-w-2xl mx-auto">
            {t('dashboard.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="success" className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Blockchain Secured</span>
            </Badge>
            <Badge variant="info" className="flex items-center space-x-1">
              <Smartphone className="w-3 h-3" />
              <span>PWA Ready</span>
            </Badge>
            <Badge variant="warning" className="flex items-center space-x-1">
              <Leaf className="w-3 h-3" />
              <span>Carbon Credits</span>
            </Badge>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Button
            onClick={() => setShowQRScanner(true)}
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <QrCode className="w-8 h-8" />
            <span className="text-sm">{t('action.scanQR')}</span>
          </Button>
          <Button
            variant="secondary"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setActiveSection('loans')}
          >
            <IndianRupee className="w-8 h-8" />
            <span className="text-sm">{t('action.getLoan')}</span>
          </Button>
          <Button
            variant="accent"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setActiveSection('marketplace')}
          >
            <TrendingUp className="w-8 h-8" />
            <span className="text-sm">{t('action.market')}</span>
          </Button>
          <Button
            variant="ghost"
            className="h-auto p-4 flex flex-col items-center space-y-2 border border-primary-green"
            onClick={() => setActiveSection('insurance')}
          >
            <Shield className="w-8 h-8" />
            <span className="text-sm">{t('action.insurance')}</span>
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div 
            className="ceo-card cursor-pointer"
            onClick={() => {
              alert('Revenue Details:\n\nTotal Revenue: ₹28,50,000\nMonthly Growth: +12.5%\nSource: Crop Sales + Carbon Credits\n\nView detailed revenue reports in the Analytics section.')
            }}
          >
            <RevenueStatsCard revenue={2850000} change={12.5} />
          </div>
          <div 
            className="ceo-card cursor-pointer"
            onClick={() => {
              alert('Crop Portfolio:\n\nActive Crops: 47\nSeason Growth: +8%\nCrops: Wheat, Rice, Pulses\n\nView detailed crop management in the Dashboard.')
            }}
          >
            <CropStatsCard crops={47} change={8} />
          </div>
          <div 
            className="ceo-card cursor-pointer"
            onClick={() => {
              alert('Carbon Credits:\n\nTotal Credits: 1,250\nEarned This Month: +15\nValue: ₹125 per credit\n\nTrade credits in the Marketplace!')
            }}
          >
            <CarbonStatsCard credits={1250} change={15} />
          </div>
          <div 
            className="ceo-card cursor-pointer"
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
                  alert('Crop Tokenization:\n\nReady to tokenize your crops!\n\nProcess:\n1. Verify crop quality\n2. Calculate carbon credits\n3. Mint yield tokens\n4. List on marketplace\n\nProceed to Tokenization Center?')
                }}>
                  <Leaf className="w-4 h-4 mr-2" />
                  Tokenize Crop
                </Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => {
                  alert('Shipment Tracking:\n\nActive Shipments: 3\n\n• KS-2024-05-001 - In Transit\n• KS-2024-05-002 - Processing\n• KS-2024-05-003 - Delivered\n\nView detailed tracking in Supply Chain section.')
                }}>
                  <Truck className="w-4 h-4 mr-2" />
                  Track Shipment
                </Button>
                <Button variant="accent" className="w-full justify-start" onClick={() => {
                  setActiveSection('marketplace')
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
        <section id="supply-chain" className="mt-8 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SupplyChainTimeline
              events={timelineEvents}
              batchId="KS-2024-05-001"
              cropType="Premium Wheat"
            />
          </motion.div>
        </section>

        {/* Marketplace Section */}
        <section id="marketplace" className="mt-8 scroll-mt-20">
          <Marketplace />
        </section>

        {/* Loans Section */}
        <section id="loans" className="mt-8 scroll-mt-20">
          <LoanApplication />
        </section>

        {/* Insurance Section */}
        <section id="insurance" className="mt-8 scroll-mt-20">
          <InsuranceClaims />
        </section>

        {/* Profile Section */}
        <section id="profile" className="mt-8 scroll-mt-20">
          <FarmerProfile />
        </section>

        {/* Weather Section */}
        <section id="weather" className="mt-8 scroll-mt-20">
          <WeatherWidget />
        </section>

        {/* Section Navigation */}
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white rounded-lg shadow-lg p-2 space-y-2">
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
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-green text-white'
                    : 'hover:bg-gray-100'
                }`}
                title={section.label}
              >
                {section.icon}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
