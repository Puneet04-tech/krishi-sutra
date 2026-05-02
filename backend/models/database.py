from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from datetime import datetime
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        self.database_name = os.getenv("DATABASE_NAME", "agritrust360")
    
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(self.mongodb_url)
            self.db = self.client[self.database_name]
            
            # Create indexes for better performance
            await self.create_indexes()
            print("✅ Connected to MongoDB successfully")
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("🔴 Disconnected from MongoDB")
    
    async def health_check(self):
        """Check database connection health"""
        try:
            await self.client.admin.command('ping')
            return True
        except:
            return False
    
    async def create_indexes(self):
        """Create database indexes for optimal performance"""
        # Farmers collection indexes
        await self.db.farmers.create_index("user_id", unique=True)
        await self.db.farmers.create_index("location")
        await self.db.farmers.create_index([("created_at", -1)])
        
        # Crop batches collection indexes
        await self.db.crop_batches.create_index("batch_id", unique=True)
        await self.db.crop_batches.create_index("farmer_id")
        await self.db.crop_batches.create_index("token_id")
        await self.db.crop_batches.create_index("crop_type")
        await self.db.crop_batches.create_index("status")
        await self.db.crop_batches.create_index([("created_at", -1)])
        
        # Supply chain events collection indexes
        await self.db.supply_chain_events.create_index("batch_id")
        await self.db.supply_chain_events.create_index("event_type")
        await self.db.supply_chain_events.create_index("location")
        await self.db.supply_chain_events.create_index([("timestamp", -1)])
        
        # Marketplace listings collection indexes
        await self.db.marketplace_listings.create_index("listing_id", unique=True)
        await self.db.marketplace_listings.create_index("token_id")
        await self.db.marketplace_listings.create_index("seller_id")
        await self.db.marketplace_listings.create_index("status")
        await self.db.marketplace_listings.create_index([("created_at", -1)])
        
        # Insurance policies collection indexes
        await self.db.insurance_policies.create_index("policy_id", unique=True)
        await self.db.insurance_policies.create_index("farmer_id")
        await self.db.insurance_policies.create_index("batch_id")
        await self.db.insurance_policies.create_index("status")
        
        # Insurance claims collection indexes
        await self.db.insurance_claims.create_index("claim_id", unique=True)
        await self.db.insurance_claims.create_index("policy_id")
        await self.db.insurance_claims.create_index("farmer_id")
        await self.db.insurance_claims.create_index("status")
        await self.db.insurance_claims.create_index([("created_at", -1)])
        
        print("✅ Database indexes created successfully")
    
    # Farmer Profile Operations
    async def create_farmer_profile(self, profile_data: Dict[str, Any]) -> Any:
        """Create or update farmer profile"""
        profile_data["created_at"] = datetime.utcnow()
        profile_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.farmers.update_one(
            {"user_id": profile_data["user_id"]},
            {"$set": profile_data},
            upsert=True
        )
        
        if result.upserted_id:
            return {"inserted_id": result.upserted_id}
        else:
            return {"updated": True}
    
    async def get_farmer_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get farmer profile by user ID"""
        return await self.db.farmers.find_one({"user_id": user_id})
    
    async def update_farmer_profile(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update farmer profile"""
        update_data["updated_at"] = datetime.utcnow()
        result = await self.db.farmers.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    # Crop Batch Operations
    async def create_crop_batch(self, batch_data: Dict[str, Any]) -> Any:
        """Create new crop batch"""
        batch_data["created_at"] = datetime.utcnow()
        batch_data["updated_at"] = datetime.utcnow()
        batch_data["status"] = "active"
        
        result = await self.db.crop_batches.insert_one(batch_data)
        return result
    
    async def get_farmer_batches(self, farmer_id: str) -> List[Dict[str, Any]]:
        """Get all crop batches for a farmer"""
        cursor = self.db.crop_batches.find(
            {"farmer_id": farmer_id}
        ).sort("created_at", DESCENDING)
        return await cursor.to_list(length=None)
    
    async def get_crop_batch(self, batch_id: str) -> Optional[Dict[str, Any]]:
        """Get crop batch by ID"""
        return await self.db.crop_batches.find_one({"batch_id": batch_id})
    
    async def update_crop_batch(self, batch_id: str, update_data: Dict[str, Any]) -> bool:
        """Update crop batch"""
        update_data["updated_at"] = datetime.utcnow()
        result = await self.db.crop_batches.update_one(
            {"batch_id": batch_id},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    # Supply Chain Event Operations
    async def add_supply_chain_event(self, event_data: Dict[str, Any]) -> Any:
        """Add supply chain event"""
        event_data["created_at"] = datetime.utcnow()
        event_data["timestamp"] = datetime.utcnow()
        
        result = await self.db.supply_chain_events.insert_one(event_data)
        return result
    
    async def get_supply_chain_events(self, batch_id: str) -> List[Dict[str, Any]]:
        """Get all supply chain events for a batch"""
        cursor = self.db.supply_chain_events.find(
            {"batch_id": batch_id}
        ).sort("timestamp", ASCENDING)
        return await cursor.to_list(length=None)
    
    async def get_latest_supply_chain_event(self, batch_id: str) -> Optional[Dict[str, Any]]:
        """Get latest supply chain event for a batch"""
        return await self.db.supply_chain_events.find_one(
            {"batch_id": batch_id},
            sort=[("timestamp", DESCENDING)]
        )
    
    # Marketplace Operations
    async def create_marketplace_listing(self, listing_data: Dict[str, Any]) -> Any:
        """Create marketplace listing"""
        listing_data["created_at"] = datetime.utcnow()
        listing_data["updated_at"] = datetime.utcnow()
        listing_data["status"] = "active"
        
        result = await self.db.marketplace_listings.insert_one(listing_data)
        return result
    
    async def get_active_marketplace_listings(self) -> List[Dict[str, Any]]:
        """Get all active marketplace listings"""
        cursor = self.db.marketplace_listings.find(
            {"status": "active"}
        ).sort("created_at", DESCENDING)
        return await cursor.to_list(length=None)
    
    async def get_marketplace_listing(self, listing_id: str) -> Optional[Dict[str, Any]]:
        """Get marketplace listing by ID"""
        return await self.db.marketplace_listings.find_one({"listing_id": listing_id})
    
    async def execute_purchase(self, listing_id: str, buyer_id: str, quantity: int) -> bool:
        """Execute purchase and update listing"""
        # This would typically be a transaction
        listing = await self.get_marketplace_listing(listing_id)
        if not listing:
            return False
        
        # Update listing quantity or status
        if listing["quantity"] <= quantity:
            await self.db.marketplace_listings.update_one(
                {"listing_id": listing_id},
                {"$set": {"status": "sold", "updated_at": datetime.utcnow()}}
            )
        else:
            await self.db.marketplace_listings.update_one(
                {"listing_id": listing_id},
                {"$inc": {"quantity": -quantity}, "$set": {"updated_at": datetime.utcnow()}}
            )
        
        # Record purchase
        purchase_data = {
            "listing_id": listing_id,
            "buyer_id": buyer_id,
            "seller_id": listing["seller_id"],
            "quantity": quantity,
            "price": listing["price"],
            "total_amount": quantity * listing["price"],
            "created_at": datetime.utcnow()
        }
        await self.db.purchases.insert_one(purchase_data)
        
        return True
    
    # Insurance Operations
    async def create_insurance_policy(self, policy_data: Dict[str, Any]) -> Any:
        """Create insurance policy"""
        policy_data["created_at"] = datetime.utcnow()
        policy_data["updated_at"] = datetime.utcnow()
        policy_data["status"] = "active"
        
        result = await self.db.insurance_policies.insert_one(policy_data)
        return result
    
    async def get_insurance_policies(self, farmer_id: str) -> List[Dict[str, Any]]:
        """Get insurance policies for a farmer"""
        cursor = self.db.insurance_policies.find(
            {"farmer_id": farmer_id}
        ).sort("created_at", DESCENDING)
        return await cursor.to_list(length=None)
    
    async def create_insurance_claim(self, claim_data: Dict[str, Any]) -> Any:
        """Create insurance claim"""
        claim_data["created_at"] = datetime.utcnow()
        claim_data["updated_at"] = datetime.utcnow()
        
        result = await self.db.insurance_claims.insert_one(claim_data)
        return result
    
    async def get_insurance_claims(self, farmer_id: str) -> List[Dict[str, Any]]:
        """Get insurance claims for a farmer"""
        cursor = self.db.insurance_claims.find(
            {"farmer_id": farmer_id}
        ).sort("created_at", DESCENDING)
        return await cursor.to_list(length=None)
    
    # Analytics and Reporting
    async def get_farmer_analytics(self, farmer_id: str) -> Dict[str, Any]:
        """Get comprehensive analytics for a farmer"""
        # Get total crops
        total_crops = await self.db.crop_batches.count_documents({"farmer_id": farmer_id})
        
        # Get total revenue from marketplace
        pipeline = [
            {"$match": {"seller_id": farmer_id}},
            {"$group": {"_id": None, "total_revenue": {"$sum": "$total_amount"}}}
        ]
        revenue_result = await self.db.purchases.aggregate(pipeline).to_list(length=1)
        total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
        
        # Get carbon credits
        pipeline = [
            {"$match": {"farmer_id": farmer_id}},
            {"$group": {"_id": None, "total_credits": {"$sum": "$carbon_credits"}}}
        ]
        credits_result = await self.db.crop_batches.aggregate(pipeline).to_list(length=1)
        total_credits = credits_result[0]["total_credits"] if credits_result else 0
        
        # Get insurance coverage
        total_coverage = 0
        policies = await self.get_insurance_policies(farmer_id)
        for policy in policies:
            total_coverage += policy.get("coverage_amount", 0)
        
        return {
            "total_crops": total_crops,
            "total_revenue": total_revenue,
            "total_carbon_credits": total_credits,
            "total_insurance_coverage": total_coverage,
            "active_policies": len([p for p in policies if p["status"] == "active"]),
            "completed_sales": await self.db.purchases.count_documents({"seller_id": farmer_id})
        }
    
    async def get_marketplace_analytics(self) -> Dict[str, Any]:
        """Get marketplace analytics"""
        # Total listings
        total_listings = await self.db.marketplace_listings.count_documents({"status": "active"})
        
        # Total volume
        pipeline = [
            {"$group": {"_id": None, "total_volume": {"$sum": "$total_amount"}}}
        ]
        volume_result = await self.db.purchases.aggregate(pipeline).to_list(length=1)
        total_volume = volume_result[0]["total_volume"] if volume_result else 0
        
        # Average price
        pipeline = [
            {"$group": {"_id": None, "avg_price": {"$avg": "$price"}}}
        ]
        price_result = await self.db.marketplace_listings.aggregate(pipeline).to_list(length=1)
        avg_price = price_result[0]["avg_price"] if price_result else 0
        
        return {
            "total_active_listings": total_listings,
            "total_volume": total_volume,
            "average_price": avg_price,
            "total_transactions": await self.db.purchases.count_documents({})
        }
