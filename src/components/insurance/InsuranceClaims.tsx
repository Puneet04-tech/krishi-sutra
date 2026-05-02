'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  Shield, 
  CloudRain, 
  Sun, 
  Thermometer, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Calendar,
  IndianRupee
} from 'lucide-react'

interface InsurancePolicy {
  id: string
  policyNumber: string
  cropName: string
  coverageAmount: number
  premium: number
  startDate: string
  endDate: string
  status: 'active' | 'expired' | 'claimed'
  coverageType: 'weather' | 'price' | 'comprehensive'
  riskFactors: string[]
}

interface Claim {
  id: string
  policyId: string
  claimType: 'weather' | 'price' | 'damage'
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'processing'
  submittedDate: string
  description: string
  evidence: string[]
  estimatedPayout: number
}

interface WeatherAlert {
  id: string
  type: 'flood' | 'drought' | 'storm' | 'heatwave'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: string
  description: string
  affectedArea: string
  timestamp: string
  actionRequired: boolean
}

interface InsuranceClaimsProps {}

export const InsuranceClaims: React.FC<InsuranceClaimsProps> = () => {
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'alerts'>('policies')
  const [notification, setNotification] = useState<string | null>(null)

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  // Handle file claim
  const handleFileClaim = async (policy: InsurancePolicy) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      showNotification(`Claim filed for policy ${policy.policyNumber}!`)
      
      // Here you would make actual API call:
      // const response = await fetch('/api/insurance/claim', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ policyId: policy.id, claimType: 'damage' })
      // })
    } catch (error) {
      showNotification('Failed to file claim. Please try again.')
    }
  }

  // Handle view policy details
  const handleViewPolicyDetails = (policy: InsurancePolicy) => {
    showNotification(`Viewing details for policy ${policy.policyNumber}`)
    console.log('View policy details:', policy)
  }

  const mockPolicies: InsurancePolicy[] = [
    {
      id: '1',
      policyNumber: 'KASI-2024-001',
      cropName: 'Premium Wheat',
      coverageAmount: 500000,
      premium: 15000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      coverageType: 'comprehensive',
      riskFactors: ['Weather', 'Price Volatility', 'Pest Damage']
    },
    {
      id: '2',
      policyNumber: 'KASI-2024-002',
      cropName: 'Organic Rice',
      coverageAmount: 300000,
      premium: 9000,
      startDate: '2024-02-15',
      endDate: '2025-02-14',
      status: 'active',
      coverageType: 'weather',
      riskFactors: ['Flood', 'Drought', 'Temperature']
    }
  ]

  const mockClaims: Claim[] = [
    {
      id: '1',
      policyId: '1',
      claimType: 'weather',
      amount: 150000,
      status: 'approved',
      submittedDate: '2024-03-15',
      description: 'Crop damage due to unexpected rainfall during harvest season',
      evidence: ['Satellite Images', 'Weather Reports', 'Field Assessment'],
      estimatedPayout: 120000
    },
    {
      id: '2',
      policyId: '2',
      claimType: 'price',
      amount: 75000,
      status: 'processing',
      submittedDate: '2024-04-20',
      description: 'Price drop below minimum support price',
      evidence: ['Market Price Data', 'Government Notifications'],
      estimatedPayout: 60000
    }
  ]

  const mockAlerts: WeatherAlert[] = [
    {
      id: '1',
      type: 'flood',
      severity: 'high',
      location: 'Punjab Region',
      description: 'Heavy rainfall expected in the next 48 hours',
      affectedArea: '200 sq km',
      timestamp: '2024-04-30 14:30',
      actionRequired: true
    },
    {
      id: '2',
      type: 'heatwave',
      severity: 'medium',
      location: 'Rajasthan',
      description: 'Temperature expected to rise above 45°C',
      affectedArea: '150 sq km',
      timestamp: '2024-04-30 12:15',
      actionRequired: false
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'processing': return 'info'
      case 'rejected': return 'error'
      default: return 'warning'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'flood': return <CloudRain className="w-5 h-5" />
      case 'drought': return <Sun className="w-5 h-5" />
      case 'heatwave': return <Thermometer className="w-5 h-5" />
      default: return <AlertTriangle className="w-5 h-5" />
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
          <h2 className="text-2xl font-bold text-primary-green">Crop Insurance</h2>
          <p className="text-secondary-slate-600 mt-1">Parametric insurance with automated payouts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="success" className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Blockchain Verified</span>
          </Badge>
          <Badge variant="info" className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>AI-Powered</span>
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-slate-600">Active Policies</p>
                <p className="text-2xl font-bold text-primary-green">2</p>
              </div>
              <Shield className="w-8 h-8 text-primary-green opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-slate-600">Total Coverage</p>
                <p className="text-2xl font-bold text-primary-green">₹8L</p>
              </div>
              <IndianRupee className="w-8 h-8 text-primary-green opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-slate-600">Claims Filed</p>
                <p className="text-2xl font-bold text-accent-gold">2</p>
              </div>
              <FileText className="w-8 h-8 text-accent-gold opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-slate-600">Payouts</p>
                <p className="text-2xl font-bold text-green-600">₹1.2L</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-slate-200">
        <nav className="flex space-x-8">
          {[
            { id: 'policies', label: 'My Policies', icon: Shield },
            { id: 'claims', label: 'Claims', icon: FileText },
            { id: 'alerts', label: 'Weather Alerts', icon: CloudRain }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-green text-primary-green'
                  : 'border-transparent text-secondary-slate-600 hover:text-primary-green'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary-green">Active Insurance Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockPolicies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{policy.cropName}</CardTitle>
                        <p className="text-sm text-secondary-slate-600 mt-1">Policy: {policy.policyNumber}</p>
                      </div>
                      <Badge variant={policy.status === 'active' ? 'success' : 'error'}>
                        {policy.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-secondary-slate-600">Coverage Amount</span>
                        <p className="font-bold text-primary-green">{formatCurrency(policy.coverageAmount)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-secondary-slate-600">Annual Premium</span>
                        <p className="font-semibold">{formatCurrency(policy.premium)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-secondary-slate-600">Coverage Type</span>
                        <p className="font-medium capitalize">{policy.coverageType}</p>
                      </div>
                      <div>
                        <span className="text-sm text-secondary-slate-600">Valid Until</span>
                        <p className="font-medium">{policy.endDate}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-primary-green">Risk Factors Covered</h4>
                      <div className="flex flex-wrap gap-2">
                        {policy.riskFactors.map((factor, idx) => (
                          <Badge key={idx} variant="default" size="sm">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1"
                        onClick={() => handleFileClaim(policy)}
                      >
                        File Claim
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewPolicyDetails(policy)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary-green">Insurance Claims</h3>
          <div className="space-y-4">
            {mockClaims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-primary-green">Claim #{claim.id}</h4>
                        <p className="text-sm text-secondary-slate-600 mt-1">{claim.description}</p>
                      </div>
                      <Badge variant={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-secondary-slate-600">Claim Amount</span>
                        <p className="font-bold text-primary-green">{formatCurrency(claim.amount)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-secondary-slate-600">Estimated Payout</span>
                        <p className="font-semibold text-accent-gold">{formatCurrency(claim.estimatedPayout)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-secondary-slate-600">Submitted Date</span>
                        <p className="font-medium">{claim.submittedDate}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm text-primary-green">Evidence Submitted</h5>
                      <div className="flex flex-wrap gap-2">
                        {claim.evidence.map((evidence, idx) => (
                          <Badge key={idx} variant="default" size="sm">
                            {evidence}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {claim.status === 'processing' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-secondary-slate-600">Processing Progress</span>
                          <span className="text-sm font-medium">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary-green">Weather Alerts & Risk Monitoring</h3>
          <div className="space-y-4">
            {mockAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${
                          alert.severity === 'critical' ? 'bg-red-100' :
                          alert.severity === 'high' ? 'bg-orange-100' :
                          alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-primary-green capitalize">{alert.type} Alert</h4>
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            {alert.actionRequired && (
                              <Badge variant="warning">Action Required</Badge>
                            )}
                          </div>
                          <p className="text-secondary-slate-600 mb-2">{alert.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-secondary-slate-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{alert.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{alert.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
