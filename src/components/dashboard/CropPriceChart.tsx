'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PriceData {
  date: string
  price: number
  predicted?: number
}

interface CropPriceChartProps {
  data: PriceData[]
  cropName: string
  currentPrice: number
  priceChange: number
}

export const CropPriceChart: React.FC<CropPriceChartProps> = ({
  data,
  cropName,
  currentPrice,
  priceChange
}) => {
  const formatPrice = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphism p-3 rounded-lg border border-white/20">
          <p className="text-sm font-semibold text-primary-green">{label}</p>
          <p className="text-sm text-secondary-slate-700">
            Market: {formatPrice(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-sm text-accent-gold-700">
              Predicted: {formatPrice(payload[1].value)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{cropName} Price Trends</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={priceChange >= 0 ? 'success' : 'error'} className="flex items-center space-x-1">
              {priceChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{priceChange > 0 ? '+' : ''}{priceChange}%</span>
            </Badge>
            <span className="text-sm font-semibold text-primary-green">
              {formatPrice(currentPrice)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4332" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1B4332" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB703" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FFB703" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#6C757D"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6C757D"
                tickFormatter={(value) => `₹${value/1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#1B4332"
                strokeWidth={2}
                fill="url(#colorPrice)"
                name="Market Price"
              />
              {data.some(d => d.predicted) && (
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#FFB703"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorPredicted)"
                  name="Predicted Price"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-green rounded-full"></div>
              <span className="text-secondary-slate-600">Market Price</span>
            </div>
            {data.some(d => d.predicted) && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent-gold rounded-full"></div>
                <span className="text-secondary-slate-600">Predicted</span>
              </div>
            )}
          </div>
          <span className="text-secondary-slate-500">Last 30 days</span>
        </div>
      </CardContent>
    </Card>
  )
}
