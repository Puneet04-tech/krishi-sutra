'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  IndianRupee, 
  Calculator, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Shield,
  Leaf
} from 'lucide-react'

interface LoanOffer {
  id: string
  lender: string
  amount: number
  interestRate: number
  tenure: number
  emi: number
  processingFee: number
  approvalTime: string
  requirements: string[]
  benefits: string[]
  rating: number
  verified: boolean
}

interface LoanApplicationProps {}

export const LoanApplication: React.FC<LoanApplicationProps> = () => {
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [applicationStep, setApplicationStep] = useState(1)

  const mockOffers: LoanOffer[] = [
    {
      id: '1',
      lender: 'State Bank of Agriculture',
      amount: 500000,
      interestRate: 8.5,
      tenure: 12,
      emi: 43670,
      processingFee: 5000,
      approvalTime: '24 hours',
      requirements: ['Kisan Credit Card', 'Land Documents', 'Aadhaar Card'],
      benefits: ['Subsidized Interest', 'Quick Disbursement', 'Flexible Repayment'],
      rating: 4.8,
      verified: true
    },
    {
      id: '2',
      lender: 'KrishiCooperative Bank',
      amount: 750000,
      interestRate: 9.2,
      tenure: 18,
      emi: 43250,
      processingFee: 7500,
      approvalTime: '48 hours',
      requirements: ['Bank Statement', 'Crop Insurance', 'Yield History'],
      benefits: ['Higher Loan Amount', 'Crop-linked Repayment', 'Insurance Coverage'],
      rating: 4.6,
      verified: true
    },
    {
      id: '3',
      lender: 'Digital Agri Finance',
      amount: 300000,
      interestRate: 7.8,
      tenure: 9,
      emi: 34500,
      processingFee: 3000,
      approvalTime: '2 hours',
      requirements: ['Digital KYC', 'Mobile Number', 'Bank Account'],
      benefits: ['Instant Approval', 'No Collateral', 'Carbon Credit Bonus'],
      rating: 4.5,
      verified: true
    }
  ]

  const applicationSteps = [
    { id: 1, title: 'Select Loan Offer', description: 'Choose the best loan option' },
    { id: 2, title: 'Document Upload', description: 'Upload required documents' },
    { id: 3, title: 'Verification', description: 'AI-powered document verification' },
    { id: 4, title: 'Approval', description: 'Get instant loan approval' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-green">Agri-Loan Application</h2>
          <p className="text-secondary-slate-600 mt-1">Get instant loans using your yield tokens as collateral</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="success" className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Blockchain Secured</span>
          </Badge>
          <Badge variant="info" className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Instant Approval</span>
          </Badge>
        </div>
      </div>

      {/* Application Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary-green" />
            <span>Application Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={(applicationStep / 4) * 100} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {applicationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`text-center p-3 rounded-lg border ${
                    applicationStep >= step.id
                      ? 'border-primary-green bg-primary-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    applicationStep >= step.id
                      ? 'bg-primary-green text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {applicationStep > step.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm">{step.title}</h4>
                  <p className="text-xs text-secondary-slate-600 mt-1">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Offers */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary-green">Available Loan Offers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockOffers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`h-full cursor-pointer transition-all duration-300 ${
                selectedOffer === offer.id
                  ? 'ring-2 ring-primary-green shadow-lg'
                  : 'hover:shadow-lg'
              }`}
                onClick={() => setSelectedOffer(offer.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{offer.lender}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-semibold text-accent-gold">★</span>
                          <span className="text-sm font-medium">{offer.rating}</span>
                        </div>
                        {offer.verified && (
                          <Badge variant="success" size="sm">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Loan Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-slate-600">Loan Amount</span>
                      <span className="font-bold text-primary-green">{formatCurrency(offer.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-slate-600">Interest Rate</span>
                      <span className="font-semibold">{offer.interestRate}% p.a.</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-slate-600">Tenure</span>
                      <span className="font-medium">{offer.tenure} months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-secondary-slate-600">Monthly EMI</span>
                      <span className="font-semibold">{formatCurrency(offer.emi)}</span>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-primary-green">Benefits</h4>
                    <div className="space-y-1">
                      {offer.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-secondary-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{offer.approvalTime}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-accent-gold-600">
                      <Leaf className="w-4 h-4" />
                      <span>Carbon Bonus</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className={`w-full ${
                      selectedOffer === offer.id ? 'bg-primary-green' : ''
                    }`}
                    variant={selectedOffer === offer.id ? 'primary' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedOffer(offer.id)
                      setApplicationStep(2)
                    }}
                  >
                    {selectedOffer === offer.id ? 'Selected' : 'Select This Offer'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Loan Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-primary-green" />
            <span>Loan Calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-slate-700 mb-2">
                  Loan Amount
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-slate-400 w-4 h-4" />
                  <input
                    type="number"
                    defaultValue="500000"
                    className="w-full pl-10 pr-4 py-2 border border-secondary-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-slate-700 mb-2">
                  Interest Rate (% p.a.)
                </label>
                <input
                  type="number"
                  defaultValue="8.5"
                  step="0.1"
                  className="w-full px-4 py-2 border border-secondary-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-slate-700 mb-2">
                  Tenure (months)
                </label>
                <input
                  type="number"
                  defaultValue="12"
                  className="w-full px-4 py-2 border border-secondary-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
              </div>
            </div>
            <div className="bg-primary-green-50 rounded-lg p-6">
              <h4 className="font-semibold text-primary-green mb-4">Calculation Results</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary-slate-600">Monthly EMI:</span>
                  <span className="font-bold text-primary-green">₹43,670</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-slate-600">Total Interest:</span>
                  <span className="font-semibold">₹24,040</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-slate-600">Total Amount:</span>
                  <span className="font-semibold">₹524,040</span>
                </div>
                <div className="pt-3 border-t border-primary-green-200">
                  <div className="flex items-center space-x-2 text-sm text-accent-gold-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>You may save up to 15% with carbon credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
