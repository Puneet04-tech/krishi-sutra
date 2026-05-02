# AgriTrust 360 Backend

A comprehensive Python FastAPI backend for the AgriTrust 360 agricultural blockchain ecosystem.

## 🚀 Features

### Core Services
- **Blockchain Integration**: Web3.py integration with Polygon/Ethereum smart contracts
- **Risk Engine**: ML-powered risk assessment for loans and insurance
- **AI Vision**: Computer vision for crop quality analysis
- **Satellite Data**: Integration with satellite APIs for carbon credits
- **IPFS Storage**: Decentralized storage for certificates and documents
- **Real-time Updates**: WebSocket support for live marketplace and alerts

### Smart Contracts
- **YieldToken**: ERC721 tokens for agricultural yield
- **Marketplace**: Decentralized trading platform
- **Insurance**: Parametric insurance with automated payouts

## 📋 Requirements

- Python 3.9+
- MongoDB 5.0+
- Node.js (for frontend)
- IPFS node or Infura account
- Polygon Mumbai testnet ETH

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd agritrust360/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your configuration
```

5. **Install MongoDB**
```bash
# On Ubuntu/Debian
sudo apt-get install mongodb

# On macOS
brew install mongodb-community

# On Windows
# Download and install from MongoDB website
```

6. **Start MongoDB**
```bash
mongod
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=agritrust360

# Blockchain
BLOCKCHAIN_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here

# IPFS
INFURA_PROJECT_ID=your_infura_project_id
INFURA_PROJECT_SECRET=your_infura_project_secret

# APIs
WEATHER_API_KEY=your_weather_api_key
MARKET_API_KEY=your_market_api_key
```

### Smart Contract Deployment

1. **Install Brownie**
```bash
pip install eth-brownie
```

2. **Initialize Brownie**
```bash
brownie init
```

3. **Deploy contracts**
```bash
brownie run scripts/deploy.py --network polygon-mumbai
```

## 🚀 Running the Application

### Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 API Endpoints

### Farmer Management
- `POST /api/farmer/profile` - Create farmer profile
- `GET /api/farmer/profile` - Get farmer profile
- `PUT /api/farmer/profile` - Update farmer profile

### Crop Management
- `POST /api/crops/batch` - Create crop batch
- `GET /api/crops/batches` - Get farmer's crop batches
- `GET /api/crops/batch/{batch_id}` - Get specific batch

### Supply Chain
- `POST /api/supply-chain/event` - Add supply chain event
- `GET /api/supply-chain/batch/{batch_id}` - Get supply chain timeline

### Marketplace
- `POST /api/marketplace/list` - List yield token
- `GET /api/marketplace/listings` - Get active listings
- `POST /api/marketplace/buy/{listing_id}` - Buy yield token

### Insurance
- `POST /api/insurance/policy` - Create insurance policy
- `POST /api/insurance/claim` - File insurance claim
- `GET /api/insurance/policies` - Get farmer's policies

### AI Services
- `POST /api/ai/analyze-crop` - Analyze crop quality
- `GET /api/satellite/carbon-credits` - Calculate carbon credits

### Risk Assessment
- `POST /api/risk/assess` - Assess loan risk

## 🤖 AI Models

### Crop Quality Analysis

The AI vision service uses TensorFlow for crop quality assessment:

```python
# Model architecture
model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),
    tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(3, activation='softmax')  # premium, standard, substandard
])
```

### Risk Assessment

Machine learning model for loan and insurance risk:

```python
# Random Forest for risk scoring
risk_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)
```

## 🛡️ Security

### Authentication
- JWT token-based authentication
- Role-based access control
- API rate limiting

### Data Protection
- Input validation with Pydantic
- SQL injection prevention
- XSS protection

### Blockchain Security
- Smart contract audits
- Multi-signature verification
- Reentrancy protection

## 📊 Database Schema

### Collections

1. **farmers** - Farmer profiles and credentials
2. **crop_batches** - Crop batch information and metadata
3. **supply_chain_events** - Supply chain tracking data
4. **marketplace_listings** - Marketplace listings and transactions
5. **insurance_policies** - Insurance policy data
6. **insurance_claims** - Insurance claim records

### Indexes

Optimized indexes for performance:

```javascript
// Farmers collection
db.farmers.createIndex({"user_id": 1}, {unique: true})
db.farmers.createIndex({"location": 1})

// Crop batches collection
db.crop_batches.createIndex({"batch_id": 1}, {unique: true})
db.crop_batches.createIndex({"farmer_id": 1})
db.crop_batches.createIndex({"token_id": 1})
```

## 🌐 Blockchain Integration

### Smart Contract Interactions

```python
# Example: Minting yield token
async def mint_yield_token(farmer_id, crop_type, quantity, quality_score, ipfs_hash):
    contract = w3.eth.contract(address=contract_address, abi=contract_abi)
    transaction = contract.functions.mintYieldToken(
        farmer_id, crop_type, quantity, quality_score, ipfs_hash
    ).build_transaction({
        'from': account_address,
        'nonce': w3.eth.get_transaction_count(account_address)
    })
    
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_hash.hex()
```

### Event Listening

```python
# Listen for smart contract events
def handle_token_minted(event):
    token_id = event['args']['tokenId']
    farmer_id = event['args']['farmerId']
    # Process token minted event
```

## 📡 Real-time Updates

### WebSocket Events

- `supply_chain_update` - New supply chain event
- `marketplace_update` - Marketplace listing changes
- `purchase_update` - Purchase completed
- `price_alert` - Price change alerts
- `weather_alert` - Weather warnings

### Client Integration

```javascript
// WebSocket client connection
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    handleRealtimeUpdate(data);
};
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_blockchain.py
```

### Integration Tests

```bash
# Run integration tests
pytest tests/integration/

# Run with database
pytest tests/integration/ --db-url=mongodb://localhost:27017/test
```

## 📈 Monitoring

### Health Checks

```bash
# Check API health
curl http://localhost:8000/health

# Check database connection
curl http://localhost:8000/health/db

# Check blockchain connection
curl http://localhost:8000/health/blockchain
```

### Logging

Configure logging in `logging.conf`:

```ini
[loggers]
keys=root

[handlers]
keys=consoleHandler,fileHandler

[formatters]
keys=simpleFormatter

[logger_root]
level=INFO
handlers=consoleHandler,fileHandler
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t agritrust360-backend .
docker run -p 8000:8000 agritrust360-backend
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agritrust360-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agritrust360-backend
  template:
    metadata:
      labels:
        app: agritrust360-backend
    spec:
      containers:
      - name: backend
        image: agritrust360-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@agritrust360.com
- Discord: [Join our community]

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Basic blockchain integration
- [x] AI crop quality analysis
- [x] Risk assessment engine
- [x] Marketplace functionality

### Phase 2 (Next)
- [ ] Mobile app integration
- [ ] Advanced satellite analytics
- [ ] Multi-chain support
- [ ] DeFi integration

### Phase 3 (Future)
- [ ] IoT sensor integration
- [ ] Advanced ML models
- [ ] Cross-border compliance
- [ ] Enterprise features
