from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class CropType(str, Enum):
    WHEAT = "wheat"
    RICE = "rice"
    PULSES = "pulses"
    CORN = "corn"
    COTTON = "cotton"
    SUGARCANE = "sugarcane"

class QualityGrade(str, Enum):
    PREMIUM = "premium"
    STANDARD = "standard"
    ORGANIC = "organic"

class SupplyChainEventType(str, Enum):
    HARVESTED = "harvested"
    PROCESSED = "processed"
    TRANSPORTED = "transported"
    STORED = "stored"
    QUALITY_CHECK = "quality_check"
    TOKENIZED = "tokenized"

class InsuranceType(str, Enum):
    WEATHER = "weather"
    PRICE = "price"
    COMPREHENSIVE = "comprehensive"

class ClaimType(str, Enum):
    WEATHER_DAMAGE = "weather_damage"
    PRICE_DROP = "price_drop"
    QUALITY_ISSUE = "quality_issue"

# Base Models
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True
        use_enum_values = True

# Farmer Profile
class FarmerProfile(BaseSchema):
    user_id: str
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: str = Field(..., min_length=10, max_length=15)
    location: str = Field(..., min_length=5, max_length=200)
    state: str = Field(..., min_length=2, max_length=50)
    farm_size: str = Field(..., min_length=1, max_length=50)
    experience_years: int = Field(..., ge=0, le=100)
    certifications: List[str] = Field(default_factory=list)
    bank_account: Optional[str] = None
    aadhaar_number: Optional[str] = None
    rating: float = Field(default=0.0, ge=0, le=5)
    verification_status: str = Field(default="pending")

# Crop Batch
class CropBatch(BaseSchema):
    batch_id: Optional[str] = None
    farmer_id: Optional[str] = None
    crop_type: CropType
    quantity: float = Field(..., gt=0)  # in metric tons
    quality_grade: QualityGrade
    planting_date: datetime
    expected_harvest_date: datetime
    actual_harvest_date: Optional[datetime] = None
    location: str = Field(..., min_length=5, max_length=200)
    farm_coordinates: Optional[Dict[str, float]] = None  # {"lat": 0.0, "lng": 0.0}
    image_url: Optional[str] = None
    quality_score: Optional[float] = Field(None, ge=0, le=100)
    carbon_credits: Optional[float] = Field(None, ge=0)
    green_score: Optional[float] = Field(None, ge=0, le=100)
    token_id: Optional[str] = None
    ipfs_hash: Optional[str] = None
    status: str = Field(default="active")
    soil_type: Optional[str] = None
    irrigation_method: Optional[str] = None
    fertilizer_used: Optional[List[str]] = None
    pesticide_used: Optional[List[str]] = None

# Yield Token
class YieldToken(BaseSchema):
    token_id: str
    batch_id: str
    farmer_id: str
    crop_type: CropType
    quantity: float
    quality_score: float
    carbon_credits: float
    ipfs_hash: str
    created_at: datetime
    owner_address: str
    is_locked: bool = Field(default=False)  # Locked for collateral
    lock_expiration: Optional[datetime] = None

# Supply Chain Event
class SupplyChainEvent(BaseSchema):
    event_id: Optional[str] = None
    batch_id: str
    event_type: SupplyChainEventType
    timestamp: datetime
    location: str
    handler_name: str = Field(..., min_length=2, max_length=100)
    handler_id: str
    temperature: Optional[float] = Field(None, ge=-50, le=60)
    humidity: Optional[float] = Field(None, ge=0, le=100)
    quality_check_passed: Optional[bool] = None
    notes: Optional[str] = None
    image_evidence: Optional[List[str]] = None
    verified: bool = Field(default=False)
    blockchain_tx: Optional[str] = None

# Insurance Policy
class InsurancePolicy(BaseSchema):
    policy_id: Optional[str] = None
    farmer_id: Optional[str] = None
    batch_id: str
    policy_type: InsuranceType
    coverage_amount: float = Field(..., gt=0)
    premium: Optional[float] = Field(None, gt=0)
    start_date: datetime
    end_date: datetime
    deductible: float = Field(default=0.0, ge=0)
    coverage_percentage: float = Field(default=100.0, ge=0, le=100)
    status: str = Field(default="active")
    risk_factors: List[str] = Field(default_factory=list)
    parametric_triggers: Optional[Dict[str, Any]] = None

# Insurance Claim
class Claim(BaseSchema):
    claim_id: Optional[str] = None
    policy_id: str
    farmer_id: Optional[str] = None
    claim_type: ClaimType
    amount: float = Field(..., gt=0)
    description: str = Field(..., min_length=10, max_length=1000)
    incident_date: datetime
    evidence: List[str] = Field(default_factory=list)
    weather_data: Optional[Dict[str, Any]] = None
    market_price_data: Optional[Dict[str, Any]] = None
    status: str = Field(default="pending")
    approved_amount: Optional[float] = None
    processed_date: Optional[datetime] = None
    adjuster_notes: Optional[str] = None

# Marketplace Listing
class MarketplaceListing(BaseSchema):
    listing_id: Optional[str] = None
    token_id: str
    seller_id: Optional[str] = None
    quantity: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    minimum_bid: Optional[float] = None
    auction_end: Optional[datetime] = None
    description: Optional[str] = None
    status: str = Field(default="active")
    created_at: Optional[datetime] = None
    views: int = Field(default=0)
    bids: List[Dict[str, Any]] = Field(default_factory=list)

# Purchase Order
class PurchaseOrder(BaseSchema):
    order_id: Optional[str] = None
    listing_id: str
    buyer_id: str
    seller_id: str
    quantity: float
    price: float
    total_amount: float
    status: str = Field(default="pending")
    payment_status: str = Field(default="pending")
    delivery_address: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

# Risk Assessment
class RiskAssessment(BaseSchema):
    batch_id: str
    farmer_id: str
    overall_risk_score: float = Field(..., ge=0, le=100)
    weather_risk: float = Field(..., ge=0, le=100)
    market_risk: float = Field(..., ge=0, le=100)
    quality_risk: float = Field(..., ge=0, le=100)
    loan_eligibility: bool
    max_loan_amount: Optional[float] = None
    recommended_interest_rate: Optional[float] = None
    risk_factors: List[str] = Field(default_factory=list)
    mitigation_suggestions: List[str] = Field(default_factory=list)
    assessment_date: datetime = Field(default_factory=datetime.utcnow)

# Weather Data
class WeatherData(BaseSchema):
    location: str
    date: datetime
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    soil_moisture: Optional[float] = None
    uv_index: Optional[float] = None
    weather_condition: str
    source: str = Field(default="api")

# Satellite Data
class SatelliteData(BaseSchema):
    location: str
    date: datetime
    ndvi: float  # Normalized Difference Vegetation Index
    evi: float   # Enhanced Vegetation Index
    land_surface_temperature: float
    soil_moisture: float
    carbon_sequestration: float
    green_score: float
    cloud_cover: float
    satellite_provider: str = Field(default="sentinel")
    image_url: Optional[str] = None

# AI Analysis Result
class AIAnalysisResult(BaseSchema):
    image_url: str
    analysis_date: datetime = Field(default_factory=datetime.utcnow)
    quality_score: float = Field(..., ge=0, le=100)
    grade: QualityGrade
    defects_detected: List[str] = Field(default_factory=list)
    moisture_content: Optional[float] = None
    size_distribution: Optional[Dict[str, float]] = None
    color_analysis: Optional[Dict[str, float]] = None
    confidence_score: float = Field(..., ge=0, le=1)
    processing_time: float  # in seconds
    model_version: str

# Transaction Record
class TransactionRecord(BaseSchema):
    tx_hash: str
    from_address: str
    to_address: str
    amount: float
    token_id: Optional[str] = None
    transaction_type: str  # mint, transfer, purchase, etc.
    block_number: int
    timestamp: datetime
    gas_used: int
    gas_price: float
    status: str = Field(default="confirmed")

# Notification
class Notification(BaseSchema):
    notification_id: Optional[str] = None
    user_id: str
    type: str  # info, warning, success, error
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

# API Response Models
class APIResponse(BaseSchema):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None

class PaginatedResponse(BaseSchema):
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int

# Request/Response for specific endpoints
class CropQualityRequest(BaseSchema):
    image_url: str
    crop_type: CropType
    expected_grade: Optional[QualityGrade] = None

class CarbonCreditRequest(BaseSchema):
    location: str
    start_date: datetime
    end_date: datetime
    farming_practices: List[str]
    crop_type: CropType
    farm_size: float

class LoanRequest(BaseSchema):
    farmer_id: str
    batch_id: str
    requested_amount: float
    loan_purpose: str
    collateral_type: str = Field(default="yield_token")
    repayment_period: int = Field(..., gt=0)  # in months

class InsuranceQuoteRequest(BaseSchema):
    farmer_id: str
    batch_id: str
    coverage_type: InsuranceType
    coverage_amount: float
    deductible: float = Field(default=0.0)
    coverage_period: int = Field(..., gt=0)  # in days
