'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApiConnection } from '@/hooks/useApiConnection';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Wifi, WifiOff, RefreshCw, Server, Database, Shield } from 'lucide-react';

export const ConnectionStatusIndicator: React.FC = () => {
  const { isConnected, isConnecting, backendStatus, error, reconnect } = useApiConnection();

  const getStatusColor = () => {
    if (isConnecting) return 'warning';
    if (isConnected) return 'success';
    return 'info'; // Changed to info for mock data mode
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    return 'Using Mock Data';
  };

  const getStatusIcon = () => {
    if (isConnecting) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (isConnected) return <Wifi className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[300px]"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor()} className="flex items-center space-x-1">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </Badge>
          </div>
          {!isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reconnect}
              className="p-1"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-3 p-2 bg-red-50 rounded text-xs text-red-600"
          >
            {error}
          </motion.div>
        )}

        {backendStatus && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 font-medium">Backend Services:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-1">
                <Server className="w-3 h-3" />
                <span className="text-xs">API:</span>
                <Badge 
                  variant={backendStatus.status === 'healthy' ? 'success' : 'error'} 
                  size="sm"
                >
                  {backendStatus.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span className="text-xs">DB:</span>
                <Badge 
                  variant={backendStatus.database_connected ? 'success' : 'error'} 
                  size="sm"
                >
                  {backendStatus.database_connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span className="text-xs">Chain:</span>
                <Badge 
                  variant={backendStatus.blockchain_connected ? 'success' : 'error'} 
                  size="sm"
                >
                  {backendStatus.blockchain_connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs">v{backendStatus.version}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
