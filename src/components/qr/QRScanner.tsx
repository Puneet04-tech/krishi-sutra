'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

interface ScanResult {
  success: boolean
  message: string
  data?: any
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startScanning = async () => {
    setIsScanning(true)
    setScanResult(null)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera access denied:', error)
      setScanResult({
        success: false,
        message: 'Camera access denied. Please check permissions.'
      })
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const simulateScan = () => {
    setIsProcessing(true)
    
    // Simulate QR code scanning process
    setTimeout(() => {
      const mockData = {
        batchId: 'KS-2024-05-001',
        cropType: 'Organic Wheat',
        farmer: 'Rajesh Kumar',
        location: 'Punjab, India',
        quality: 'Premium',
        harvestDate: '2024-04-15',
        carbonCredits: 250,
        tokenValue: 45000
      }

      setScanResult({
        success: true,
        message: 'Successfully scanned crop batch!',
        data: mockData
      })
      
      setIsProcessing(false)
      stopScanning()
      
      setTimeout(() => {
        onScan(JSON.stringify(mockData))
      }, 1500)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Scan QR Code</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!scanResult ? (
              <div className="space-y-4">
                {/* Camera View */}
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  {isScanning ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {/* Scanning Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="w-48 h-48 border-2 border-accent-gold rounded-lg"
                          animate={{
                            boxShadow: [
                              '0 0 0 0 rgba(255, 183, 3, 0.7)',
                              '0 0 0 10px rgba(255, 183, 3, 0)',
                              '0 0 0 20px rgba(255, 183, 3, 0)'
                            ]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                        />
                      </div>
                      {/* Scanning Line */}
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-accent-gold to-transparent"
                        animate={{
                          y: ['0%', '100%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="w-16 h-16 text-secondary-slate-400" />
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-secondary-slate-600">
                    Position the QR code within the frame to scan
                  </p>
                  <Badge variant="info" className="mx-auto">
                    Blockchain-Verified Scanning
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {!isScanning ? (
                    <Button
                      onClick={startScanning}
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button
                      onClick={stopScanning}
                      variant="secondary"
                      className="flex-1"
                    >
                      Stop Scanning
                    </Button>
                  )}
                  
                  <Button
                    onClick={simulateScan}
                    variant="accent"
                    disabled={isProcessing}
                    loading={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? 'Scanning...' : 'Demo Scan'}
                  </Button>
                </div>
              </div>
            ) : (
              /* Scan Result */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-center">
                  {scanResult.success ? (
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                  ) : (
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                  )}
                  <h3 className="text-lg font-semibold text-primary-green">
                    {scanResult.success ? 'Scan Successful!' : 'Scan Failed'}
                  </h3>
                  <p className="text-sm text-secondary-slate-600 mt-1">
                    {scanResult.message}
                  </p>
                </div>

                {scanResult.data && (
                  <div className="glassmorphism rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-primary-green mb-3">Batch Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-secondary-slate-500">Batch ID:</span>
                        <p className="font-medium">{scanResult.data.batchId}</p>
                      </div>
                      <div>
                        <span className="text-secondary-slate-500">Crop Type:</span>
                        <p className="font-medium">{scanResult.data.cropType}</p>
                      </div>
                      <div>
                        <span className="text-secondary-slate-500">Farmer:</span>
                        <p className="font-medium">{scanResult.data.farmer}</p>
                      </div>
                      <div>
                        <span className="text-secondary-slate-500">Location:</span>
                        <p className="font-medium">{scanResult.data.location}</p>
                      </div>
                      <div>
                        <span className="text-secondary-slate-500">Quality:</span>
                        <Badge variant="success" size="sm">
                          {scanResult.data.quality}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-secondary-slate-500">Carbon Credits:</span>
                        <p className="font-medium">{scanResult.data.carbonCredits}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={onClose}
                  className="w-full"
                >
                  Close
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
