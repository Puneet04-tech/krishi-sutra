import { useState, useEffect } from 'react';
import { checkBackendConnection, healthCheck } from '@/services/api';

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  backendStatus?: {
    status: string;
    timestamp: string;
    version: string;
    blockchain_connected: boolean;
    database_connected: boolean;
  };
  error?: string;
  lastChecked: Date;
}

export const useApiConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isConnecting: true,
    lastChecked: new Date(),
  });

  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, isConnecting: true, error: undefined }));
    
    try {
      const isConnected = await checkBackendConnection();
      const healthResponse = await healthCheck();
      
      setConnectionStatus({
        isConnected,
        isConnecting: false,
        backendStatus: healthResponse.success ? healthResponse.data : undefined,
        lastChecked: new Date(),
      });
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        lastChecked: new Date(),
      }));
    }
  };

  useEffect(() => {
    // Check connection on mount
    checkConnection();
    
    // Set up periodic connection checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...connectionStatus,
    checkConnection,
    reconnect: checkConnection,
  };
};
