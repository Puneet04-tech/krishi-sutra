'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Thermometer, 
  Wind, 
  Droplets, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Eye,
  Gauge
} from 'lucide-react'

interface WeatherData {
  location: string
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  pressure: number
  visibility: number
  uvIndex: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
  forecast: {
    day: string
    high: number
    low: number
    condition: string
    precipitation: number
  }[]
  alerts: {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    time: string
  }[]
}

interface WeatherWidgetProps {}

export const WeatherWidget: React.FC<WeatherWidgetProps> = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate weather data fetch
    const fetchWeatherData = () => {
      setTimeout(() => {
        setWeatherData({
          location: 'Ludhiana, Punjab',
          temperature: 28,
          feelsLike: 30,
          humidity: 65,
          windSpeed: 12,
          pressure: 1013,
          visibility: 10,
          uvIndex: 6,
          condition: 'sunny',
          forecast: [
            { day: 'Tomorrow', high: 32, low: 22, condition: 'sunny', precipitation: 10 },
            { day: 'Thursday', high: 30, low: 21, condition: 'cloudy', precipitation: 30 },
            { day: 'Friday', high: 28, low: 20, condition: 'rainy', precipitation: 70 },
            { day: 'Saturday', high: 29, low: 19, condition: 'cloudy', precipitation: 40 },
            { day: 'Sunday', high: 31, low: 21, condition: 'sunny', precipitation: 20 }
          ],
          alerts: [
            {
              type: 'Heat Wave',
              severity: 'medium',
              message: 'High temperature expected. Ensure proper irrigation.',
              time: 'Today 2:00 PM'
            },
            {
              type: 'Rainfall',
              severity: 'low',
              message: 'Light rainfall expected on Friday.',
              time: 'Friday 6:00 AM'
            }
          ]
        })
        setLoading(false)
      }, 1000)
    }

    fetchWeatherData()
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-500" />
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-500" />
      case 'stormy': return <CloudRain className="w-8 h-8 text-purple-500" />
      default: return <Sun className="w-8 h-8 text-yellow-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      default: return 'default'
    }
  }

  const getForecastIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-500" />
      default: return <Sun className="w-5 h-5 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weatherData) return null

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary-green" />
              <span>{weatherData.location}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 1000)
              }}
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Weather Display */}
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-primary-green-50 rounded-lg">
                {getWeatherIcon(weatherData.condition)}
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-green">
                  {weatherData.temperature}°C
                </div>
                <div className="text-sm text-secondary-slate-600">
                  Feels like {weatherData.feelsLike}°C
                </div>
                <div className="text-sm font-medium capitalize mt-1">
                  {weatherData.condition}
                </div>
              </div>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-secondary-slate-600">Humidity</p>
                  <p className="font-semibold">{weatherData.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-secondary-slate-600">Wind Speed</p>
                  <p className="font-semibold">{weatherData.windSpeed} km/h</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs text-secondary-slate-600">Pressure</p>
                  <p className="font-semibold">{weatherData.pressure} mb</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-secondary-slate-600">Visibility</p>
                  <p className="font-semibold">{weatherData.visibility} km</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-accent-gold" />
              <span>Weather Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weatherData.alerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-secondary-slate-50 rounded-lg"
                >
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary-green">{alert.type}</h4>
                    <p className="text-sm text-secondary-slate-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-secondary-slate-500 mt-2">{alert.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary-green" />
            <span>5-Day Forecast</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {weatherData.forecast.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center p-4 bg-secondary-slate-50 rounded-lg"
              >
                <h4 className="font-semibold text-primary-green mb-2">{day.day}</h4>
                <div className="flex justify-center mb-2">
                  {getForecastIcon(day.condition)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{day.high}°/{day.low}°</p>
                  <p className="text-xs text-secondary-slate-600 capitalize">{day.condition}</p>
                  <div className="flex items-center justify-center space-x-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span className="text-xs">{day.precipitation}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agricultural Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary-green" />
            <span>Agricultural Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">Irrigation Recommendation</h4>
              <p className="text-sm text-green-600">
                Based on current humidity levels, moderate irrigation recommended for wheat crops. 
                Avoid overwatering to prevent fungal diseases.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-2">Pest Activity Alert</h4>
              <p className="text-sm text-blue-600">
                Current temperature and humidity conditions may increase pest activity. 
                Monitor crops regularly and consider preventive measures.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-700 mb-2">Harvest Timing</h4>
              <p className="text-sm text-yellow-600">
                Optimal harvest conditions expected in 3-4 days. 
                Plan harvesting activities accordingly for maximum yield.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-700 mb-2">Soil Moisture</h4>
              <p className="text-sm text-purple-600">
                Soil moisture levels are adequate. Current weather patterns suggest 
                maintaining regular irrigation schedule.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
