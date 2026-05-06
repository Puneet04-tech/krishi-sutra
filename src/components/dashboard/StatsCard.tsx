'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, TrendingDown, IndianRupee, Package, Leaf, Shield } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
  trend?: 'up' | 'down' | 'neutral'
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  trend = 'neutral'
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-600" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />
    return null
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <div className="p-2 bg-emerald-50 rounded-lg">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 mb-2">
            {value}
          </div>
          {change !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
              {changeLabel && (
                <Badge variant="default" size="sm">
                  {changeLabel}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const RevenueStatsCard: React.FC<{ revenue: number; change: number }> = ({ revenue, change }) => (
  <StatsCard
    title="Total Revenue"
    value={`₹${revenue.toLocaleString('en-IN')}`}
    change={change}
    changeLabel="This month"
    icon={<IndianRupee className="w-5 h-5 text-primary-green" />}
    trend={change >= 0 ? 'up' : 'down'}
  />
)

export const CropStatsCard: React.FC<{ crops: number; change: number }> = ({ crops, change }) => (
  <StatsCard
    title="Active Crops"
    value={crops.toString()}
    change={change}
    changeLabel="This season"
    icon={<Package className="w-5 h-5 text-primary-green" />}
    trend={change >= 0 ? 'up' : 'down'}
  />
)

export const CarbonStatsCard: React.FC<{ credits: number; change: number }> = ({ credits, change }) => (
  <StatsCard
    title="Carbon Credits"
    value={credits.toString()}
    change={change}
    changeLabel="Earned"
    icon={<Leaf className="w-5 h-5 text-primary-green" />}
    trend={change >= 0 ? 'up' : 'down'}
    variant="success"
  />
)

export const InsuranceStatsCard: React.FC<{ coverage: number; active: boolean }> = ({ coverage, active }) => (
  <StatsCard
    title="Insurance Coverage"
    value={`₹${coverage.toLocaleString('en-IN')}`}
    icon={<Shield className="w-5 h-5 text-primary-green" />}
    variant={active ? 'success' : 'warning'}
  />
)
