from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from typing import List, Optional
import uvicorn
import asyncio
import json
from datetime import datetime
import os
from dotenv import load_dotenv

# Import our modules
from models.database import Database
from models.schemas import (
    CropBatch, YieldToken, InsurancePolicy, Claim, 
    SupplyChainEvent, FarmerProfile, MarketplaceListing
)
from services.blockchain_service import BlockchainService
from services.risk_engine import RiskEngine
from services.ai_vision import CropQualityAnalyzer
from services.satellite_service import SatelliteDataService
from services.ipfs_service import IPFSService
from services.websocket_manager import WebSocketManager

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AgriTrust 360 API",
    description="Decentralized blockchain ecosystem for automated agri-financing and supply chain provenance",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize services
db = Database()
blockchain_service = BlockchainService()
risk_engine = RiskEngine()
ai_analyzer = CropQualityAnalyzer()
satellite_service = SatelliteDataService()
ipfs_service = IPFSService()
websocket_manager = WebSocketManager()

# Dependency to get current user
async def get_current_user(token: str = Depends(security)):
    # Implement JWT token validation here
    return {"user_id": "demo_user", "role": "farmer"}

@app.on_event("startup")
async def startup_event():
    """Initialize database connections and blockchain contracts"""
    await db.connect()
    await blockchain_service.initialize_contracts()
    print("🚀 AgriTrust 360 Backend Started Successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup connections"""
    await db.disconnect()
    print("🔴 AgriTrust 360 Backend Shut Down")

# Health Check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "blockchain_connected": await blockchain_service.is_connected(),
        "database_connected": await db.health_check()
    }

# Farmer Profile Management
@app.post("/api/farmer/profile")
async def create_farmer_profile(
    profile: FarmerProfile,
    current_user: dict = Depends(get_current_user)
):
    """Create or update farmer profile"""
    try:
        profile_data = profile.dict()
        profile_data["user_id"] = current_user["user_id"]
        
        # Store on blockchain
        tx_hash = await blockchain_service.register_farmer(profile_data)
        
        # Store in database
        result = await db.create_farmer_profile(profile_data)
        
        return {
            "success": True,
            "profile_id": result.inserted_id,
            "blockchain_tx": tx_hash,
            "message": "Farmer profile created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/farmer/profile")
async def get_farmer_profile(current_user: dict = Depends(get_current_user)):
    """Get farmer profile"""
    try:
        profile = await db.get_farmer_profile(current_user["user_id"])
        if not profile:
            raise HTTPException(status_code=404, detail="Farmer profile not found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Crop Batch Management
@app.post("/api/crops/batch")
async def create_crop_batch(
    batch: CropBatch,
    current_user: dict = Depends(get_current_user)
):
    """Create new crop batch for tokenization"""
    try:
        # Analyze crop quality using AI
        if batch.image_url:
            quality_score = await ai_analyzer.analyze_crop_quality(batch.image_url)
            batch.quality_score = quality_score
        
        # Get satellite data for carbon credits
        if batch.location:
            carbon_data = await satellite_service.calculate_carbon_credits(
                batch.location, batch.planting_date, batch.harvest_date
            )
            batch.carbon_credits = carbon_data["credits"]
            batch.green_score = carbon_data["green_score"]
        
        # Store batch data on IPFS
        batch_data = batch.dict()
        ipfs_hash = await ipfs_service.upload_json(batch_data)
        
        # Create yield token on blockchain
        token_id = await blockchain_service.mint_yield_token(
            current_user["user_id"],
            batch.crop_type,
            batch.quantity,
            batch.quality_score,
            ipfs_hash
        )
        
        # Store in database
        batch_data["token_id"] = token_id
        batch_data["ipfs_hash"] = ipfs_hash
        batch_data["farmer_id"] = current_user["user_id"]
        result = await db.create_crop_batch(batch_data)
        
        # Assess risk for loan eligibility
        risk_assessment = await risk_engine.assess_crop_risk(batch_data)
        
        return {
            "success": True,
            "batch_id": result.inserted_id,
            "token_id": token_id,
            "ipfs_hash": ipfs_hash,
            "quality_score": quality_score,
            "carbon_credits": carbon_data["credits"],
            "risk_assessment": risk_assessment,
            "message": "Crop batch created and tokenized successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/crops/batches")
async def get_crop_batches(current_user: dict = Depends(get_current_user)):
    """Get all crop batches for a farmer"""
    try:
        batches = await db.get_farmer_batches(current_user["user_id"])
        return {"batches": batches, "count": len(batches)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Supply Chain Events
@app.post("/api/supply-chain/event")
async def add_supply_chain_event(
    event: SupplyChainEvent,
    current_user: dict = Depends(get_current_user)
):
    """Add supply chain event to batch"""
    try:
        # Verify event authenticity
        verification = await blockchain_service.verify_supply_chain_event(
            event.batch_id, event.event_type, event.location
        )
        
        if not verification["verified"]:
            raise HTTPException(status_code=400, detail="Event verification failed")
        
        # Store event on blockchain
        tx_hash = await blockchain_service.add_supply_chain_event(
            event.batch_id, event.dict()
        )
        
        # Store in database
        event_data = event.dict()
        event_data["verified"] = True
        event_data["blockchain_tx"] = tx_hash
        result = await db.add_supply_chain_event(event_data)
        
        # Notify WebSocket clients
        await websocket_manager.broadcast_supply_chain_update(event_data)
        
        return {
            "success": True,
            "event_id": result.inserted_id,
            "blockchain_tx": tx_hash,
            "message": "Supply chain event added successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/supply-chain/batch/{batch_id}")
async def get_supply_chain_timeline(batch_id: str):
    """Get complete supply chain timeline for a batch"""
    try:
        events = await db.get_supply_chain_events(batch_id)
        return {"batch_id": batch_id, "events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Marketplace
@app.post("/api/marketplace/list")
async def list_yield_token(
    listing: MarketplaceListing,
    current_user: dict = Depends(get_current_user)
):
    """List yield token for sale on marketplace"""
    try:
        # Verify token ownership
        ownership = await blockchain_service.verify_token_ownership(
            current_user["user_id"], listing.token_id
        )
        
        if not ownership:
            raise HTTPException(status_code=403, detail="Not authorized to list this token")
        
        # Create listing on blockchain
        listing_id = await blockchain_service.create_marketplace_listing(
            listing.token_id, listing.price, listing.quantity
        )
        
        # Store in database
        listing_data = listing.dict()
        listing_data["listing_id"] = listing_id
        listing_data["seller_id"] = current_user["user_id"]
        result = await db.create_marketplace_listing(listing_data)
        
        # Notify WebSocket clients
        await websocket_manager.broadcast_marketplace_update(listing_data)
        
        return {
            "success": True,
            "listing_id": listing_id,
            "message": "Token listed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/marketplace/listings")
async def get_marketplace_listings():
    """Get all active marketplace listings"""
    try:
        listings = await db.get_active_marketplace_listings()
        return {"listings": listings, "count": len(listings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/marketplace/buy/{listing_id}")
async def buy_yield_token(
    listing_id: str,
    quantity: int,
    current_user: dict = Depends(get_current_user)
):
    """Buy yield token from marketplace"""
    try:
        # Execute purchase on blockchain
        purchase_tx = await blockchain_service.execute_purchase(
            current_user["user_id"], listing_id, quantity
        )
        
        # Update database
        await db.execute_purchase(listing_id, current_user["user_id"], quantity)
        
        # Notify WebSocket clients
        await websocket_manager.broadcast_purchase_update({
            "listing_id": listing_id,
            "buyer_id": current_user["user_id"],
            "quantity": quantity,
            "tx_hash": purchase_tx
        })
        
        return {
            "success": True,
            "transaction_hash": purchase_tx,
            "message": "Purchase completed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Insurance
@app.post("/api/insurance/policy")
async def create_insurance_policy(
    policy: InsurancePolicy,
    current_user: dict = Depends(get_current_user)
):
    """Create insurance policy for crop batch"""
    try:
        # Calculate premium based on risk assessment
        risk_data = await risk_engine.assess_insurance_risk(policy.dict())
        premium = risk_data["premium"]
        
        # Create policy on blockchain
        policy_id = await blockchain_service.create_insurance_policy(
            current_user["user_id"], policy.batch_id, premium, policy.coverage_amount
        )
        
        # Store in database
        policy_data = policy.dict()
        policy_data["policy_id"] = policy_id
        policy_data["premium"] = premium
        policy_data["farmer_id"] = current_user["user_id"]
        result = await db.create_insurance_policy(policy_data)
        
        return {
            "success": True,
            "policy_id": policy_id,
            "premium": premium,
            "risk_assessment": risk_data,
            "message": "Insurance policy created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/insurance/claim")
async def file_insurance_claim(
    claim: Claim,
    current_user: dict = Depends(get_current_user)
):
    """File insurance claim"""
    try:
        # Verify claim validity using parametric triggers
        claim_validation = await risk_engine.validate_parametric_claim(claim.dict())
        
        if not claim_validation["valid"]:
            raise HTTPException(status_code=400, detail="Claim validation failed")
        
        # Process claim on blockchain
        claim_id = await blockchain_service.process_insurance_claim(
            claim.policy_id, claim.amount, claim.claim_type
        )
        
        # Store in database
        claim_data = claim.dict()
        claim_data["claim_id"] = claim_id
        claim_data["farmer_id"] = current_user["user_id"]
        claim_data["status"] = "approved"
        result = await db.create_insurance_claim(claim_data)
        
        return {
            "success": True,
            "claim_id": claim_id,
            "payout_amount": claim.amount,
            "validation_data": claim_validation,
            "message": "Insurance claim processed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI Vision Analysis
@app.post("/api/ai/analyze-crop")
async def analyze_crop_quality(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Analyze crop quality using computer vision"""
    try:
        # Save uploaded file
        file_path = f"temp/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analyze with AI
        analysis_result = await ai_analyzer.analyze_crop_quality(file_path)
        
        # Clean up
        os.remove(file_path)
        
        return {
            "success": True,
            "analysis": analysis_result,
            "message": "Crop quality analysis completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Satellite Data
@app.get("/api/satellite/carbon-credits")
async def get_carbon_credits(
    location: str,
    start_date: str,
    end_date: str,
    current_user: dict = Depends(get_current_user)
):
    """Calculate carbon credits for farming practices"""
    try:
        carbon_data = await satellite_service.calculate_carbon_credits(
            location, start_date, end_date
        )
        return {
            "success": True,
            "carbon_data": carbon_data,
            "message": "Carbon credits calculated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket connection for real-time updates"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle WebSocket messages
            await websocket_manager.send_personal_message(f"Echo: {data}", websocket)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

# Risk Assessment
@app.post("/api/risk/assess")
async def assess_loan_risk(
    batch_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Assess risk for loan eligibility"""
    try:
        risk_assessment = await risk_engine.assess_crop_risk(batch_data)
        return {
            "success": True,
            "risk_assessment": risk_assessment,
            "message": "Risk assessment completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
