// API Service for Krishi Sutra Backend Integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fallback mock data for when backend is not available
const getMockData = (endpoint: string) => {
  const mockData: Record<string, any> = {
    '/api/farmer/profile': {
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
    },
    '/api/tokens/list': [
      {
        id: '1',
        cropName: 'Premium Wheat',
        farmer: 'Rajesh Kumar',
        location: 'Punjab',
        quantity: 500,
        pricePerToken: 3450,
        totalValue: 1725000,
        quality: 'Premium',
        carbonCredits: 250,
        harvestDate: '2024-04-15',
        priceChange: 12.5,
        rating: 4.8,
        verified: true
      },
      {
        id: '2',
        cropName: 'Organic Rice',
        farmer: 'Meera Patel',
        location: 'Gujarat',
        quantity: 300,
        pricePerToken: 4200,
        totalValue: 1260000,
        quality: 'Organic',
        carbonCredits: 180,
        harvestDate: '2024-04-10',
        priceChange: 8.2,
        rating: 4.9,
        verified: true
      }
    ],
    '/api/insurance/policies': [
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
      }
    ],
    '/api/marketplace/listings': [
      {
        id: '1',
        cropName: 'Premium Wheat',
        farmer: 'Rajesh Kumar',
        location: 'Punjab',
        quantity: 500,
        pricePerToken: 3450,
        totalValue: 1725000,
        quality: 'Premium',
        carbonCredits: 250,
        harvestDate: '2024-04-15',
        priceChange: 12.5,
        rating: 4.8,
        verified: true
      }
    ]
  };
  
  return mockData[endpoint] || null;
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log(`Making API request to: ${url}`);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Error:', error);
      
      // Fallback to mock data if backend is not available
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Backend not responding, using mock data for:', endpoint);
        const mockData = getMockData(endpoint);
        if (mockData) {
          return {
            success: true,
            data: mockData,
            message: 'Using mock data (backend unavailable)',
          };
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Health check
export const healthCheck = async (): Promise<ApiResponse<{
  status: string;
  timestamp: string;
  version: string;
  blockchain_connected: boolean;
  database_connected: boolean;
}>> => {
  return apiClient.get('/health');
};

// Farmer Profile API
export const farmerProfileApi = {
  create: async (profileData: any) => 
    apiClient.post('/api/farmer/profile', profileData),
  
  get: async () => 
    apiClient.get('/api/farmer/profile'),
  
  update: async (profileData: any) => 
    apiClient.put('/api/farmer/profile', profileData),
};

// Yield Token API
export const yieldTokenApi = {
  create: async (tokenData: any) => 
    apiClient.post('/api/tokens/create', tokenData),
  
  list: async () => 
    apiClient.get('/api/tokens/list'),
  
  buy: async (tokenId: string, amount: number) => 
    apiClient.post(`/api/tokens/${tokenId}/buy`, { amount }),
};

// Insurance API
export const insuranceApi = {
  getPolicies: async () => 
    apiClient.get('/api/insurance/policies'),
  
  createPolicy: async (policyData: any) => 
    apiClient.post('/api/insurance/policies', policyData),
  
  fileClaim: async (claimData: any) => 
    apiClient.post('/api/insurance/claims', claimData),
  
  getClaims: async () => 
    apiClient.get('/api/insurance/claims'),
};

// Supply Chain API
export const supplyChainApi = {
  getEvents: async (batchId?: string) => 
    apiClient.get(batchId ? `/api/supply-chain/${batchId}` : '/api/supply-chain'),
  
  addEvent: async (eventData: any) => 
    apiClient.post('/api/supply-chain/events', eventData),
  
  verifyBatch: async (batchId: string) => 
    apiClient.post(`/api/supply-chain/${batchId}/verify`),
};

// Marketplace API
export const marketplaceApi = {
  getListings: async () => 
    apiClient.get('/api/marketplace/listings'),
  
  createListing: async (listingData: any) => 
    apiClient.post('/api/marketplace/listings', listingData),
  
  purchase: async (listingId: string, quantity: number) => 
    apiClient.post(`/api/marketplace/${listingId}/purchase`, { quantity }),
};

// Weather API
export const weatherApi = {
  getCurrent: async (location: string) => 
    apiClient.get(`/api/weather/current?location=${encodeURIComponent(location)}`),
  
  getForecast: async (location: string, days: number = 5) => 
    apiClient.get(`/api/weather/forecast?location=${encodeURIComponent(location)}&days=${days}`),
  
  getAlerts: async (location: string) => 
    apiClient.get(`/api/weather/alerts?location=${encodeURIComponent(location)}`),
};

// Connection status checker
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await healthCheck();
    return response.success && response.data?.status === 'healthy';
  } catch (error) {
    console.error('Backend connection check failed:', error);
    return false;
  }
};

export default apiClient;
