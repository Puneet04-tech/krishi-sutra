'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  IndianRupee, 
  TrendingUp, 
  Leaf, 
  Clock, 
  MapPin, 
  Star,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface YieldToken {
  id: string
  cropName: string
  farmer: string
  location: string
  quantity: number
  pricePerToken: number
  totalValue: number
  quality: 'Premium' | 'Standard' | 'Organic'
  carbonCredits: number
  harvestDate: string
  priceChange: number
  rating: number
  verified: boolean
}

interface MarketplaceProps {}

export const Marketplace: React.FC<MarketplaceProps> = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  // Handle buy token
  const handleBuyToken = async (token: YieldToken) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      showNotification(`Successfully purchased ${token.cropName} tokens!`)
      
      // Here you would make actual API call:
      // const response = await fetch('/api/marketplace/buy', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ tokenId: token.id, quantity: 1 })
      // })
    } catch (error) {
      showNotification('Failed to purchase tokens. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle view details
  const handleViewDetails = (token: YieldToken) => {
    showNotification(`Viewing details for ${token.cropName}`)
    // Here you would navigate to detail page or open modal
    console.log('View details:', token)
  }

  const mockTokens: YieldToken[] = [
    {
      id: '1',
      cropName: 'Premium Wheat',
      farmer: 'Rajesh Kumar',
      location: 'Punjab',
      quantity: 500,
      pricePerToken: 3450,
      totalValue: 1725000,
      quality: 'Premium',
      carbonCredits: 250,
      harvestDate: '2024-04-15',
      priceChange: 12.5,
      rating: 4.8,
      verified: true
    },
    {
      id: '2',
      cropName: 'Organic Rice',
      farmer: 'Meera Patel',
      location: 'Gujarat',
      quantity: 300,
      pricePerToken: 4200,
      totalValue: 1260000,
      quality: 'Organic',
      carbonCredits: 180,
      harvestDate: '2024-04-10',
      priceChange: 8.2,
      rating: 4.9,
      verified: true
    },
    {
      id: '3',
      cropName: 'Basmati Rice',
      farmer: 'Amit Singh',
      location: 'Haryana',
      quantity: 200,
      pricePerToken: 5800,
      totalValue: 1160000,
      quality: 'Premium',
      carbonCredits: 120,
      harvestDate: '2024-04-08',
      priceChange: -2.1,
      rating: 4.7,
      verified: true
    },
    {
      id: '4',
      cropName: 'Organic Pulses',
      farmer: 'Sunita Devi',
      location: 'Madhya Pradesh',
      quantity: 150,
      pricePerToken: 2800,
      totalValue: 420000,
      quality: 'Organic',
      carbonCredits: 90,
      harvestDate: '2024-04-12',
      priceChange: 15.3,
      rating: 4.6,
      verified: true
    }
  ]

  const filteredTokens = mockTokens.filter(token => {
    const matchesFilter = selectedFilter === 'all' || token.quality.toLowerCase() === selectedFilter
    const matchesSearch = token.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         token.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         token.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Premium': return 'success'
      case 'Organic': return 'warning'
      default: return 'default'
    }
  }

  
  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-primary-green text-white px-4 py-3 rounded-lg shadow-lg"
        >
          {notification}
        </motion.div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-green">Yield Token Marketplace</h2>
          <p className="text-secondary-slate-600 mt-1">Trade blockchain-verified agricultural assets</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="success" className="flex items-center space-x-1">
            <Leaf className="w-3 h-3" />
            <span>Carbon Credits Available</span>
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search crops, farmers, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-secondary-slate-600" />
              <div className="flex space-x-2">
                {['all', 'premium', 'organic', 'standard'].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="capitalize"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTokens.map((token, index) => (
          <motion.div
            key={token.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{token.cropName}</CardTitle>
                    <p className="text-sm text-secondary-slate-600 mt-1">{token.farmer}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={getQualityColor(token.quality)} className="capitalize">
                      {token.quality}
                    </Badge>
                    {token.verified && (
                      <Badge variant="success" size="sm">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location and Rating */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-secondary-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{token.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-accent-gold fill-current" />
                    <span className="font-medium">{token.rating}</span>
                  </div>
                </div>

                {/* Price Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-slate-600">Price per Token</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-primary-green">{formatCurrency(token.pricePerToken)}</span>
                      {token.priceChange > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-slate-600">Total Value</span>
                    <span className="font-semibold">{formatCurrency(token.totalValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-slate-600">Available Quantity</span>
                    <span className="font-medium">{token.quantity} tokens</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-secondary-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>Harvested {token.harvestDate}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-accent-gold-600">
                    <Leaf className="w-4 h-4" />
                    <span>{token.carbonCredits} credits</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleBuyToken(token)}
                  >
                    <IndianRupee className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewDetails(token)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Market Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary-green" />
            <span>Market Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-green">₹4.5L</p>
              <p className="text-sm text-secondary-slate-600">Total Volume</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-gold">640</p>
              <p className="text-sm text-secondary-slate-600">Total Tokens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
              <p className="text-sm text-secondary-slate-600">Avg. Returns</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-green">640</p>
              <p className="text-sm text-secondary-slate-600">Carbon Credits</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
