# 🌾 Krishi Sutra - Smart Agricultural Blockchain Platform

## 🏆 Smart India Hackathon (SIH) Internal Hackathon Submission

**Krishi Sutra** is a revolutionary blockchain-powered agricultural ecosystem that transforms traditional farming into a transparent, efficient, and financially inclusive digital experience. Our platform empowers farmers with yield tokenization, supply chain provenance, automated insurance, and AI-driven insights.

---

## 📋 Problem Statement

### Challenges in Indian Agriculture

1. **Lack of Financial Inclusion**: Small farmers struggle to access credit due to lack of collateral and credit history
2. **Supply Chain Opacity**: Limited visibility into crop movement creates trust issues and inefficiencies
3. **Insurance Claim Delays**: Traditional crop insurance processes are slow, bureaucratic, and prone to fraud
4. **Market Information Gaps**: Farmers lack real-time pricing and market intelligence
5. **Carbon Credit Inaccessibility**: Sustainable farming practices go unrecognized and unrewarded

### Impact on Farmers

- **70%** of Indian farmers are smallholders with limited access to formal credit
- **30%** of agricultural produce is lost due to inefficient supply chains
- **Insurance claim processing takes 45-90 days** on average
- **Farmers receive only 30-40%** of final consumer price due to middlemen

---

## 💡 Solution Overview

Krishi Sutra addresses these challenges through an integrated blockchain platform featuring:

### 🎯 Core Features

1. **Yield Tokenization** - Convert crop yields into tradable digital assets
2. **Supply Chain Provenance** - Complete transparency from farm to fork
3. **Automated Insurance** - AI-powered, parametric insurance with instant payouts
4. **Carbon Credit Marketplace** - Monetize sustainable farming practices
5. **Agri-Financing** - Use yield tokens as collateral for instant loans
6. **AI-Powered Insights** - Weather forecasting, pest alerts, and crop recommendations

---

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **Framework**: Next.js 16.2.4 with React 19
- **Styling**: TailwindCSS with custom government-friendly theme
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: Framer Motion for smooth interactions
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

#### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **Blockchain**: Web3.py for Ethereum integration
- **AI/ML**: 
  - TensorFlow for crop quality analysis
  - Satellite data integration for monitoring
  - Risk assessment algorithms
- **Storage**: IPFS for decentralized file storage
- **Real-time**: WebSocket support for live updates

#### Infrastructure
- **API Gateway**: FastAPI with CORS middleware
- **Authentication**: JWT tokens with role-based access
- **Caching**: Redis for performance optimization
- **Message Queue**: Celery for async task processing

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Dashboard│  │Marketplace│  │ Insurance│  │ Profile  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway (FastAPI)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Auth     │  │ Business │  │ AI/ML    │  │ Blockchain│  │
│  │ Service  │  │ Logic    │  │ Services │  │ Integration│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   MongoDB    │   │   Ethereum   │   │     IPFS     │
│   Database   │   │  Blockchain  │   │   Storage    │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: v18+ and npm
- **Python**: 3.11+
- **MongoDB**: v6.0+ (or MongoDB Atlas)
- **Ethereum Wallet**: MetaMask or similar

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/Puneet04-tech/krishi-sutra.git
cd krishi-sutra

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the backend server
python main.py

# API will be available at http://localhost:8000
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/krishi_sutra

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address

# IPFS
IPFS_GATEWAY_URL=https://ipfs.io/ipfs

# JWT
JWT_SECRET_KEY=your_jwt_secret_here
JWT_ALGORITHM=HS256

# Redis
REDIS_URL=redis://localhost:6379

# Satellite Data
SATELLITE_API_KEY=your_satellite_api_key
```

---

## 📱 Features Deep Dive

### 1. Yield Tokenization

Farmers can tokenize their crop yields into digital assets that can be traded on our marketplace.

**Benefits:**
- **Instant Liquidity**: Sell future harvests at current market prices
- **Price Discovery**: Transparent pricing through market mechanisms
- **Risk Mitigation**: Lock in prices before harvest
- **Collateral**: Use tokens as loan collateral

**Process:**
1. Register crop details (type, quantity, quality)
2. AI-powered quality assessment
3. Token minting on blockchain
4. Marketplace listing
5. Trading and settlement

### 2. Supply Chain Provenance

Complete transparency from seed to consumer using blockchain technology.

**Features:**
- **QR Code Tracking**: Scan to view complete journey
- **Real-time Updates**: Live tracking of crop movement
- **Quality Verification**: Automated quality checks at each stage
- **Smart Contracts**: Automated payments and compliance

**Stages Tracked:**
- Seed selection and planting
- Growth monitoring (satellite data)
- Harvest and quality assessment
- Processing and packaging
- Transportation and logistics
- Retail and consumer delivery

### 3. Automated Insurance

AI-powered parametric insurance with instant payouts based on predefined triggers.

**Coverage Types:**
- **Weather Insurance**: Automatic payout on adverse weather events
- **Price Insurance**: Protection against price drops
- **Yield Insurance**: Coverage for production shortfalls
- **Comprehensive**: All-risk coverage

**Key Features:**
- **Instant Payouts**: Smart contract-based automated settlements
- **Transparent Terms**: Clear policy conditions on blockchain
- **Fraud Prevention**: Immutable claim records
- **Lower Premiums**: Risk-based pricing using AI

### 4. Carbon Credit Marketplace

Monetize sustainable farming practices through carbon credit trading.

**Eligible Practices:**
- Organic farming
- Reduced chemical usage
- Soil conservation
- Water management
- Biodiversity preservation

**Process:**
1. Practice verification through satellite data
2. Carbon credit calculation
3. Credit certification
4. Marketplace listing
5. Trading with buyers

### 5. Agri-Financing

Access to instant credit using yield tokens as collateral.

**Loan Features:**
- **Instant Approval**: AI-powered credit assessment
- **Flexible Terms**: Crop-linked repayment schedules
- **Lower Interest**: Risk-based competitive rates
- **No Collateral**: Yield tokens serve as security

**Loan Types:**
- Working capital loans
- Equipment financing
- Input purchase loans
- Emergency credit

### 6. AI-Powered Insights

Comprehensive agricultural intelligence for better decision-making.

**Features:**
- **Weather Forecasting**: 7-day accurate predictions
- **Pest Alerts**: Early warning system
- **Crop Recommendations**: AI-based suggestions
- **Market Prices**: Real-time commodity prices
- **Soil Health**: Analysis and recommendations

---

## 🎨 UI/UX Design

### Design Principles

- **Government-Friendly**: Professional, trustworthy aesthetic
- **Accessibility**: WCAG AA compliant with high contrast
- **Responsive**: Works seamlessly on all devices
- **Intuitive**: Simple navigation for farmers of all literacy levels
- **Multilingual**: Support for multiple Indian languages

### Color Scheme

- **Primary**: Emerald Green (#10B981) - Growth and prosperity
- **Secondary**: Slate Gray - Professional and trustworthy
- **Accent**: Gold (#F59E0B) - Premium quality and value
- **Background**: Dark theme with glassmorphism effects

### Key Components

- **Dashboard**: Overview of all activities and metrics
- **Marketplace**: Token trading interface
- **Insurance**: Policy management and claims
- **Profile**: Farmer identity and achievements
- **Weather**: Agricultural intelligence
- **Supply Chain**: Tracking and verification

---

## 🔒 Security Features

### Blockchain Security
- **Smart Contracts**: Audited and tested
- **Immutable Records**: Tamper-proof data storage
- **Decentralized**: No single point of failure
- **Cryptographic**: End-to-end encryption

### Application Security
- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **Data Encryption**: AES-256 encryption for sensitive data
- **API Security**: Rate limiting and input validation
- **Audit Logs**: Complete activity tracking

---

## 📊 Impact Metrics

### Expected Outcomes

- **Financial Inclusion**: 50% increase in farmer access to credit
- **Supply Chain Efficiency**: 40% reduction in post-harvest losses
- **Insurance Speed**: 90% faster claim processing (from 45 days to 4-5 days)
- **Farmer Income**: 25% increase in net farmer income
- **Carbon Credits**: 100,000+ farmers earning from sustainable practices

### Scalability

- **Target Users**: 10 million farmers in 5 years
- **Geographic Coverage**: All major agricultural states in India
- **Crop Coverage**: All major crops (wheat, rice, pulses, vegetables)
- **Language Support**: 12+ Indian languages

---

## 🛠️ Development

### Project Structure

```
krishi-sutra/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models/              # Database models
│   ├── services/            # Business logic
│   ├── contracts/           # Smart contracts
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── services/            # API services
│   ├── hooks/               # Custom React hooks
│   └── contexts/            # React contexts
├── public/                  # Static assets
└── package.json            # Node dependencies
```

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
pytest
```

### Building for Production

```bash
# Frontend
npm run build
npm start

# Backend
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend Deployment (Docker)

```bash
# Build Docker image
docker build -t krishi-sutra-backend .

# Run container
docker run -p 8000:8000 krishi-sutra-backend
```

### Infrastructure Recommendations

- **Frontend**: Vercel or Netlify
- **Backend**: AWS EC2 or Google Cloud Run
- **Database**: MongoDB Atlas
- **Blockchain**: Ethereum Mainnet/Polygon
- **CDN**: Cloudflare
- **Monitoring**: Datadog or New Relic

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- **Frontend**: ESLint + Prettier
- **Backend**: Black + Flake8
- **Commit Messages**: Conventional Commits
- **Documentation**: Markdown with clear examples

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

**Team Name**: [Your Team Name]

**Team Members**:
- [Team Member 1] - Lead Developer
- [Team Member 2] - Blockchain Specialist
- [Team Member 3] - AI/ML Engineer
- [Team Member 4] - UI/UX Designer

---

## 📞 Contact

For questions, suggestions, or collaboration opportunities:

- **Email**: contact@krishisutra.in
- **GitHub**: https://github.com/Puneet04-tech/krishi-sutra
- **Website**: https://krishisutra.in

---

## 🙏 Acknowledgments

- **Smart India Hackathon** for the opportunity
- **Open Source Community** for amazing tools and libraries
- **Indian Farmers** whose needs inspired this solution

---

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core platform development
- ✅ Yield tokenization
- ✅ Supply chain tracking
- ✅ Basic insurance features

### Phase 2 (Q4 2024)
- 🔄 Mobile app development
- 🔄 Advanced AI features
- 🔄 Multi-language support
- 🔄 Pilot deployment in 5 districts

### Phase 3 (2025)
- ⏳ Blockchain optimization
- ⏳ Integration with government schemes
- ⏳ Expansion to 50 districts
- ⏳ Advanced analytics dashboard

### Phase 4 (2026+)
- ⏳ Pan-India rollout
- ⏳ International expansion
- ⏳ Advanced financial products
- ⏳ IoT device integration

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Ethereum Developer Portal](https://ethereum.org/developers)
- [MongoDB Documentation](https://docs.mongodb.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ for Indian Farmers**
