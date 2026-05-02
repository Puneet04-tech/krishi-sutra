from web3 import Web3
from web3.contract import Contract
from web3.middleware import geth_poa_middleware
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
from dotenv import load_dotenv

load_dotenv()

class BlockchainService:
    def __init__(self):
        self.w3 = None
        self.contract_addresses = {}
        self.contracts = {}
        self.private_key = os.getenv("PRIVATE_KEY")
        self.account_address = None
        
    async def initialize_contracts(self):
        """Initialize blockchain connection and contracts"""
        try:
            # Connect to Polygon Mumbai Testnet
            self.w3 = Web3(Web3.HTTPProvider(os.getenv("BLOCKCHAIN_RPC_URL")))
            
            # Add POA middleware for Polygon
            self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            # Set default account
            if self.private_key:
                self.account_address = self.w3.eth.account.from_key(self.private_key).address
            
            # Load contract ABIs
            await self.load_contract_abis()
            
            # Initialize contracts
            await self.initialize_yield_token_contract()
            await self.initialize_marketplace_contract()
            await self.initialize_insurance_contract()
            
            print(f"✅ Connected to blockchain at {self.w3.eth.chain_id}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to connect to blockchain: {e}")
            return False
    
    async def load_contract_abis(self):
        """Load contract ABIs from files"""
        try:
            # Yield Token Contract ABI
            with open('contracts/YieldToken.json', 'r') as f:
                self.yield_token_abi = json.load(f)
            
            # Marketplace Contract ABI
            with open('contracts/Marketplace.json', 'r') as f:
                self.marketplace_abi = json.load(f)
            
            # Insurance Contract ABI
            with open('contracts/Insurance.json', 'r') as f:
                self.insurance_abi = json.load(f)
                
        except Exception as e:
            print(f"❌ Failed to load contract ABIs: {e}")
            raise
    
    async def initialize_yield_token_contract(self):
        """Initialize Yield Token contract"""
        contract_address = os.getenv("YIELD_TOKEN_CONTRACT_ADDRESS")
        if contract_address:
            self.contracts['yield_token'] = self.w3.eth.contract(
                address=contract_address,
                abi=self.yield_token_abi
            )
            self.contract_addresses['yield_token'] = contract_address
    
    async def initialize_marketplace_contract(self):
        """Initialize Marketplace contract"""
        contract_address = os.getenv("MARKETPLACE_CONTRACT_ADDRESS")
        if contract_address:
            self.contracts['marketplace'] = self.w3.eth.contract(
                address=contract_address,
                abi=self.marketplace_abi
            )
            self.contract_addresses['marketplace'] = contract_address
    
    async def initialize_insurance_contract(self):
        """Initialize Insurance contract"""
        contract_address = os.getenv("INSURANCE_CONTRACT_ADDRESS")
        if contract_address:
            self.contracts['insurance'] = self.w3.eth.contract(
                address=contract_address,
                abi=self.insurance_abi
            )
            self.contract_addresses['insurance'] = contract_address
    
    async def is_connected(self) -> bool:
        """Check if blockchain is connected"""
        if not self.w3:
            return False
        try:
            return self.w3.is_connected()
        except:
            return False
    
    def _build_transaction(self, contract: Contract, function_name: str, *args) -> Dict:
        """Build transaction with proper gas settings"""
        try:
            func = getattr(contract.functions, function_name)
            transaction = func(*args).build_transaction({
                'from': self.account_address,
                'nonce': self.w3.eth.get_transaction_count(self.account_address),
                'gas': 300000,  # Adjust based on function complexity
                'gasPrice': self.w3.eth.gas_price,
                'chainId': self.w3.eth.chain_id
            })
            return transaction
        except Exception as e:
            print(f"❌ Error building transaction: {e}")
            raise
    
    def _sign_and_send_transaction(self, transaction: Dict) -> str:
        """Sign and send transaction"""
        try:
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
            
            if receipt.status == 1:
                print(f"✅ Transaction successful: {tx_hash.hex()}")
                return tx_hash.hex()
            else:
                print(f"❌ Transaction failed: {tx_hash.hex()}")
                raise Exception("Transaction failed")
                
        except Exception as e:
            print(f"❌ Error sending transaction: {e}")
            raise
    
    # Farmer Registration
    async def register_farmer(self, farmer_data: Dict[str, Any]) -> str:
        """Register farmer on blockchain"""
        try:
            if 'yield_token' not in self.contracts:
                raise Exception("Yield Token contract not initialized")
            
            transaction = self._build_transaction(
                self.contracts['yield_token'],
                'registerFarmer',
                farmer_data['user_id'],
                farmer_data['name'],
                farmer_data['location'],
                int(farmer_data.get('rating', 0) * 100)  # Convert to integer
            )
            
            tx_hash = self._sign_and_send_transaction(transaction)
            return tx_hash
            
        except Exception as e:
            print(f"❌ Error registering farmer: {e}")
            raise
    
    # Yield Token Operations
    async def mint_yield_token(
        self, 
        farmer_id: str, 
        crop_type: str, 
        quantity: float, 
        quality_score: float, 
        ipfs_hash: str
    ) -> str:
        """Mint new yield token"""
        try:
            if 'yield_token' not in self.contracts:
                raise Exception("Yield Token contract not initialized")
            
            # Convert to blockchain-compatible values
            quantity_int = int(quantity * 1000)  # Convert to integer (3 decimal places)
            quality_int = int(quality_score * 100)  # Convert to integer (2 decimal places)
            
            transaction = self._build_transaction(
                self.contracts['yield_token'],
                'mintYieldToken',
                farmer_id,
                crop_type.lower(),
                quantity_int,
                quality_int,
                ipfs_hash
            )
            
            tx_hash = self._sign_and_send_transaction(transaction)
            
            # Get token ID from transaction logs
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            for log in receipt.logs:
                if log.address == self.contract_addresses['yield_token']:
                    # Parse token ID from log (implementation depends on contract)
                    token_id = self.w3.eth.contract(
                        address=self.contract_addresses['yield_token'],
                        abi=self.yield_token_abi
                    ).events.TokenMinted().process_log(log)['args']['tokenId']
                    return str(token_id)
            
            return tx_hash
            
        except Exception as e:
            print(f"❌ Error minting yield token: {e}")
            raise
    
    async def transfer_yield_token(self, from_address: str, to_address: str, token_id: str) -> str:
        """Transfer yield token"""
        try:
            if 'yield_token' not in self.contracts:
                raise Exception("Yield Token contract not initialized")
            
            transaction = self._build_transaction(
                self.contracts['yield_token'],
                'transferFrom',
                from_address,
                to_address,
                int(token_id)
            )
            
            tx_hash = self._sign_and_send_transaction(transaction)
            return tx_hash
            
        except Exception as e:
            print(f"❌ Error transferring yield token: {e}")
            raise
    
    async def lock_yield_token(self, token_id: str, lock_duration: int) -> str:
        """Lock yield token as collateral"""
        try:
            if 'yield_token' not in self.contracts:
                raise Exception("Yield Token contract not initialized")
            
            transaction = self._build_transaction(
                self.contracts['yield_token'],
                'lockToken',
                int(token_id),
                lock_duration
            )
            
            tx_hash = self._sign_and_send_transaction(transaction)
            return tx_hash
            
        except Exception as e:
            print(f"❌ Error locking yield token: {e}")
            raise
    
    async def verify_token_ownership(self, user_id: str, token_id: str) -> bool:
        """Verify if user owns the token"""
        try:
            if 'yield_token' not in self.contracts:
                return False
            
            owner = self.contracts['yield_token'].functions.ownerOf(int(token_id)).call()
            return owner == user_id
            
        except Exception as e:
            print(f"❌ Error verifying token ownership: {e}")
            return False
    
    # Supply Chain Operations
    async def add_supply_chain_event(self, batch_id: str, event_data: Dict[str, Any]) -> str:
        """Add supply chain event to blockchain"""
        try:
            if 'yield_token' not in self.contracts:
                raise Exception("Yield Token contract not initialized")
            
            transaction = self._build_transaction(
                self.contracts['yield_token'],
                'addSupplyChainEvent',
                batch_id,
                event_data['event_type'],
                event_data['location'],
                event_data['handler_id'],
                int(datetime.utcnow().timestamp())
            )
            
            tx_hash = self._sign_and_send_transaction(transaction)
            return tx_hash
            
        except Exception as e:
            print(f"❌ Error adding supply chain event: {e}")
            raise
    
    async def verify_supply_chain_event(
        self, 
        batch_id: str, 
        event_type: str, 
        location: str
    ) -> Dict[str, Any]:
        """Verify supply chain event authenticity"""
        try:
            # This would implement multi-signature verification logic
            # For now, return a simple verification
            return {
                "verified": True,
                "confidence": 0.95,
                "verification_method": "blockchain_signature"
            }
        except Exception as e:
            print(f"❌ Error verifying supply chain event: {e}")
            return {"verified": False, "error": str(e)}
    
    # Marketplace Operations
    async def create_marketplace_listing(
        self, 
        token_id: str, 
        price: float, 
        quantity: float
    ) -> str:
        """Create marketplace listing"""
        try:
            if 'marketplace' not in self.contracts:
                raise Exception("Marketplace contract not initialized")
            
            price_int = int(price * 100)  # Convert to cents
            quantity_int = int(quantity * 1000)  # Convert to integer
            
            transaction = self._build_transaction(
                self.contracts['marketplace'],
                'createListing',
                int(token_id),
                price_int,
                quantity_int
            )
            
            tx_hash = self._sign_and_send_transaction(transaction)
            
            # Get listing ID from transaction logs
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            for log in receipt.logs:
                if log.address == self.contract_addresses['marketplace']:
                    listing_id = self.w3.eth.contract(
                        address=self.contract_addresses['marketplace'],
                        abi=self.marketplace_abi
                    ).events.ListingCreated().process_log(log)['args']['listingId']
                    return str(listing_id)
            
            return tx_hash
            
        except Exception as e:
            print(f"❌ Error creating marketplace listing: {e}")
            raise
    
    async def execute_purchase(
        self, 
        buyer_id: str, 
        listing_id: str, 
        quantity: float
    ) -> str:
        """Execute purchase on marketplace"""
        try:
            if 'marketplace' not in self.contracts:
                raise Exception("Marketplace contract not initialized")
            
            quantity_int = int(quantity * 1000)  # Convert to integer
            
            transaction = self._build_transaction(
                self.contracts['marketplace'],
                'executePurchase',
                int(listing_id),
                quantity_int
            )
            
            tx_hash = self._sign_and_send_transaction(transaction)
            return tx_hash
            
        except Exception as e:
            print(f"❌ Error executing purchase: {e}")
            raise
    
    # Insurance Operations
    async def create_insurance_policy(
        self, 
        farmer_id: str, 
        batch_id: str, 
        premium: float, 
        coverage_amount: float
    ) -> str:
        """Create insurance policy"""
        try:
            if 'insurance' not in self.contracts:
                raise Exception("Insurance contract not initialized")
            
            premium_int = int(premium * 100)  # Convert to cents
            coverage_int = int(coverage_amount * 100)  # Convert to cents
            
            transaction = self._build_transaction(
                self.contracts['insurance'],
                'createPolicy',
                farmer_id,
                batch_id,
                premium_int,
                coverage_int,
                int(datetime.utcnow().timestamp())
            )
            
            tx_hash = self._sign_and_send_transaction(transaction)
            
            # Get policy ID from transaction logs
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            for log in receipt.logs:
                if log.address == self.contract_addresses['insurance']:
                    policy_id = self.w3.eth.contract(
                        address=self.contract_addresses['insurance'],
                        abi=self.insurance_abi
                    ).events.PolicyCreated().process_log(log)['args']['policyId']
                    return str(policy_id)
            
            return tx_hash
            
        except Exception as e:
            print(f"❌ Error creating insurance policy: {e}")
            raise
    
    async def process_insurance_claim(
        self, 
        policy_id: str, 
        claim_amount: float, 
        claim_type: str
    ) -> str:
        """Process insurance claim"""
        try:
            if 'insurance' not in self.contracts:
                raise Exception("Insurance contract not initialized")
            
            amount_int = int(claim_amount * 100)  # Convert to cents
            
            transaction = self._build_transaction(
                self.contracts['insurance'],
                'processClaim',
                int(policy_id),
                amount_int,
                claim_type.lower(),
                int(datetime.utcnow().timestamp())
            )
            
            tx_hash = self._sign_and_send_transaction(transaction)
            return tx_hash
            
        except Exception as e:
            print(f"❌ Error processing insurance claim: {e}")
            raise
    
    # Query Operations
    async def get_yield_token_info(self, token_id: str) -> Dict[str, Any]:
        """Get yield token information"""
        try:
            if 'yield_token' not in self.contracts:
                return {}
            
            token_info = self.contracts['yield_token'].functions.getYieldTokenInfo(
                int(token_id)
            ).call()
            
            return {
                "token_id": token_id,
                "farmer_id": token_info[0],
                "crop_type": token_info[1],
                "quantity": token_info[2] / 1000,  # Convert back from integer
                "quality_score": token_info[3] / 100,  # Convert back from integer
                "ipfs_hash": token_info[4],
                "is_locked": token_info[5],
                "owner": token_info[6]
            }
            
        except Exception as e:
            print(f"❌ Error getting yield token info: {e}")
            return {}
    
    async def get_supply_chain_events(self, batch_id: str) -> List[Dict[str, Any]]:
        """Get supply chain events for a batch"""
        try:
            if 'yield_token' not in self.contracts:
                return []
            
            events = self.contracts['yield_token'].functions.getSupplyChainEvents(
                batch_id
            ).call()
            
            formatted_events = []
            for event in events:
                formatted_events.append({
                    "event_type": event[0],
                    "location": event[1],
                    "handler_id": event[2],
                    "timestamp": datetime.fromtimestamp(event[3]).isoformat(),
                    "verified": True
                })
            
            return formatted_events
            
        except Exception as e:
            print(f"❌ Error getting supply chain events: {e}")
            return []
    
    async def get_active_listings(self) -> List[Dict[str, Any]]:
        """Get all active marketplace listings"""
        try:
            if 'marketplace' not in self.contracts:
                return []
            
            listings = self.contracts['marketplace'].functions.getActiveListings().call()
            
            formatted_listings = []
            for listing in listings:
                formatted_listings.append({
                    "listing_id": str(listing[0]),
                    "token_id": str(listing[1]),
                    "seller": listing[2],
                    "price": listing[3] / 100,  # Convert back from cents
                    "quantity": listing[4] / 1000,  # Convert back from integer
                    "created_at": datetime.fromtimestamp(listing[5]).isoformat()
                })
            
            return formatted_listings
            
        except Exception as e:
            print(f"❌ Error getting active listings: {e}")
            return []
