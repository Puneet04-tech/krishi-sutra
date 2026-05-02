'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, Clock, Truck, Package, Leaf, Shield, AlertCircle } from 'lucide-react'

interface TimelineEvent {
  id: string
  title: string
  description: string
  timestamp: string
  location: string
  status: 'completed' | 'in-progress' | 'pending' | 'alert'
  icon?: React.ReactNode
  metadata?: {
    temperature?: number
    humidity?: number
    quality?: string
    verified?: boolean
  }
}

interface SupplyChainTimelineProps {
  events: TimelineEvent[]
  batchId: string
  cropType: string
}

export const SupplyChainTimeline: React.FC<SupplyChainTimelineProps> = ({
  events,
  batchId,
  cropType
}) => {
  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50'
      case 'in-progress':
        return 'border-blue-500 bg-blue-50'
      case 'pending':
        return 'border-gray-300 bg-gray-50'
      case 'alert':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getEventIcon = (title: string) => {
    if (title.toLowerCase().includes('harvest')) return <Leaf className="w-4 h-4" />
    if (title.toLowerCase().includes('transport')) return <Truck className="w-4 h-4" />
    if (title.toLowerCase().includes('package')) return <Package className="w-4 h-4" />
    if (title.toLowerCase().includes('quality') || title.toLowerCase().includes('verified')) return <Shield className="w-4 h-4" />
    return <Package className="w-4 h-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Supply Chain Journey</CardTitle>
            <p className="text-sm text-secondary-slate-600 mt-1">
              {cropType} • Batch #{batchId}
            </p>
          </div>
          <Badge variant="success" className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Blockchain Verified</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary-green to-secondary-slate-300"></div>
          
          {/* Timeline Events */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative flex items-start space-x-4"
              >
                {/* Timeline Dot */}
                <div className={`relative z-10 w-12 h-12 rounded-full border-2 ${getStatusColor(event.status)} flex items-center justify-center bg-white shadow-lg`}>
                  {event.icon || getEventIcon(event.title)}
                </div>

                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <div className="glassmorphism rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-primary-green">{event.title}</h4>
                        <p className="text-sm text-secondary-slate-600 mt-1">{event.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusIcon(event.status)}
                        <Badge variant="default" size="sm">
                          {event.timestamp}
                        </Badge>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-secondary-slate-500 mb-2">
                      <span className="font-medium">Location:</span>
                      <span className="ml-1">{event.location}</span>
                    </div>

                    {/* Metadata */}
                    {event.metadata && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                        {event.metadata.temperature !== undefined && (
                          <div className="flex items-center space-x-1 text-xs">
                            <span className="text-secondary-slate-500">Temp:</span>
                            <span className="font-medium">{event.metadata.temperature}°C</span>
                          </div>
                        )}
                        {event.metadata.humidity !== undefined && (
                          <div className="flex items-center space-x-1 text-xs">
                            <span className="text-secondary-slate-500">Humidity:</span>
                            <span className="font-medium">{event.metadata.humidity}%</span>
                          </div>
                        )}
                        {event.metadata.quality && (
                          <div className="flex items-center space-x-1 text-xs">
                            <span className="text-secondary-slate-500">Quality:</span>
                            <Badge variant={event.metadata.quality === 'Premium' ? 'success' : 'default'} size="sm">
                              {event.metadata.quality}
                            </Badge>
                          </div>
                        )}
                        {event.metadata.verified !== undefined && (
                          <div className="flex items-center space-x-1 text-xs">
                            <Shield className="w-3 h-3 text-green-500" />
                            <span className="font-medium text-green-600">Verified</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
