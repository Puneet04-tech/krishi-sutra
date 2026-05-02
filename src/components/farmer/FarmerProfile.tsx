'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Leaf, 
  TrendingUp,
  Shield,
  Camera,
  Edit,
  CheckCircle,
  Star
} from 'lucide-react'

interface FarmerProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  state: string
  joinDate: string
  totalCrops: number
  carbonCredits: number
  totalRevenue: number
  rating: number
  verificationStatus: 'verified' | 'pending' | 'unverified'
  certifications: string[]
  farmSize: string
  primaryCrops: string[]
  achievements: string[]
}

interface FarmerProfileProps {}

export const FarmerProfile: React.FC<FarmerProfileProps> = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<FarmerProfile>({
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@krishisutra.in',
    phone: '+91 98765 43210',
    location: 'Village: Rampur, District: Ludhiana',
    state: 'Punjab',
    joinDate: '2023-03-15',
    totalCrops: 47,
    carbonCredits: 1250,
    totalRevenue: 2850000,
    rating: 4.8,
    verificationStatus: 'verified',
    certifications: ['Organic Farming', 'Good Agricultural Practices', 'Carbon Farming'],
    farmSize: '15 acres',
    primaryCrops: ['Wheat', 'Rice', 'Pulses'],
    achievements: [
      'Best Farmer Award 2023',
      'Carbon Credit Champion',
      '1000+ Yield Tokens Minted'
    ]
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success'
      case 'pending': return 'warning'
      default: return 'error'
    }
  }

  // Handle view full profile
  const handleViewFullProfile = () => {
    console.log('View full profile:', profile)
    // Here you would navigate to detailed profile page or open modal
    alert('Viewing full profile details...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-green">Farmer Profile</h2>
          <p className="text-secondary-slate-600 mt-1">Manage your agricultural identity and achievements</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={getVerificationColor(profile.verificationStatus)} className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>{profile.verificationStatus}</span>
          </Badge>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </Button>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto w-24 h-24 bg-linear-to-br from-primary-green to-primary-green-500 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
                <button className="absolute bottom-0 right-0 p-2 bg-accent-gold rounded-full text-white">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <CardTitle className="text-xl mt-4">{profile.name}</CardTitle>
              <div className="flex items-center justify-center space-x-1 mt-2">
                <Star className="w-4 h-4 text-accent-gold fill-current" />
                <span className="font-semibold">{profile.rating}</span>
                <span className="text-secondary-slate-600">(127 reviews)</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-secondary-slate-400" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-secondary-slate-400" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-secondary-slate-400" />
                  <span className="text-sm">{profile.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-secondary-slate-400" />
                  <span className="text-sm">Member since {profile.joinDate}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-secondary-slate-200">
                <h4 className="font-semibold text-primary-green mb-2">Farm Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary-slate-600">Farm Size</span>
                    <span className="font-medium">{profile.farmSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary-slate-600">Primary Crops</span>
                    <span className="font-medium">{profile.primaryCrops.join(', ')}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleViewFullProfile()}
              >
                View Full Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats and Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary-green" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-green">{profile.totalCrops}</p>
                  <p className="text-sm text-secondary-slate-600">Total Crops</p>
                </div>
                <div className="text-center p-4 bg-accent-gold-50 rounded-lg">
                  <p className="text-2xl font-bold text-accent-gold">{profile.carbonCredits}</p>
                  <p className="text-sm text-secondary-slate-600">Carbon Credits</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(profile.totalRevenue)}</p>
                  <p className="text-sm text-secondary-slate-600">Total Revenue</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">4.8</p>
                  <p className="text-sm text-secondary-slate-600">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary-green" />
                <span>Certifications & Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary-green mb-3">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.map((cert, index) => (
                      <Badge key={index} variant="success" className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{cert}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-primary-green mb-3">Achievements</h4>
                  <div className="space-y-2">
                    {profile.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-accent-gold-50 rounded-lg">
                        <Award className="w-5 h-5 text-accent-gold" />
                        <span className="font-medium">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-primary-green" />
              <span>Recent Blockchain Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: 'Yield Token Minted',
                  description: 'Premium Wheat - 500 tokens',
                  timestamp: '2 hours ago',
                  hash: '0x7f9a...3b2d'
                },
                {
                  action: 'Carbon Credits Earned',
                  description: '250 credits for sustainable farming',
                  timestamp: '1 day ago',
                  hash: '0x8e2c...5f1a'
                },
                {
                  action: 'Supply Chain Update',
                  description: 'Batch #KS-2024-05-001 verified',
                  timestamp: '2 days ago',
                  hash: '0x3d9a...7c2e'
                },
                {
                  action: 'Insurance Claim Approved',
                  description: 'Weather damage claim - ₹1,20,000',
                  timestamp: '3 days ago',
                  hash: '0x1f4b...9a8d'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-primary-green">{activity.action}</h4>
                      <p className="text-sm text-secondary-slate-600">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-secondary-slate-500">{activity.timestamp}</p>
                    <p className="text-xs font-mono text-secondary-slate-400">{activity.hash}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
