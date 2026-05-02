import aiohttp
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import hashlib
import base64
from dotenv import load_dotenv

load_dotenv()

class IPFSService:
    def __init__(self):
        self.ipfs_api_url = os.getenv("IPFS_API_URL", "https://ipfs.infura.io:5001")
        self.ipfs_gateway_url = os.getenv("IPFS_GATEWAY_URL", "https://ipfs.io/ipfs")
        self.project_id = os.getenv("INFURA_PROJECT_ID")
        self.project_secret = os.getenv("INFURA_PROJECT_SECRET")
        
        # Authentication headers for Infura
        self.auth_headers = None
        if self.project_id and self.project_secret:
            auth_string = f"{self.project_id}:{self.project_secret}"
            auth_bytes = auth_string.encode('utf-8')
            auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
            self.auth_headers = {'Authorization': f'Basic {auth_b64}'}
    
    async def upload_json(self, data: Dict[str, Any]) -> str:
        """Upload JSON data to IPFS"""
        try:
            # Convert to JSON string
            json_string = json.dumps(data, indent=2)
            
            # Create IPFS add request
            url = f"{self.ipfs_api_url}/api/v0/add"
            
            payload = {
                'path': 'data.json',
                'content': json_string
            }
            
            # Make request
            async with aiohttp.ClientSession() as session:
                headers = {'Content-Type': 'application/json'}
                if self.auth_headers:
                    headers.update(self.auth_headers)
                
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        ipfs_hash = result.get('Hash')
                        
                        if ipfs_hash:
                            print(f"✅ JSON uploaded to IPFS: {ipfs_hash}")
                            return ipfs_hash
                        else:
                            raise Exception("No hash returned from IPFS")
                    else:
                        error_text = await response.text()
                        raise Exception(f"IPFS upload failed: {error_text}")
        
        except Exception as e:
            print(f"❌ Error uploading JSON to IPFS: {e}")
            raise
    
    async def upload_file(self, file_path: str) -> str:
        """Upload file to IPFS"""
        try:
            # Read file content
            with open(file_path, 'rb') as file:
                file_content = file.read()
            
            # Create IPFS add request
            url = f"{self.ipfs_api_url}/api/v0/add"
            
            # Create multipart form data
            data = aiohttp.FormData()
            data.add_field('file', file_content, filename=os.path.basename(file_path))
            
            # Make request
            async with aiohttp.ClientSession() as session:
                headers = {}
                if self.auth_headers:
                    headers.update(self.auth_headers)
                
                async with session.post(url, data=data, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        ipfs_hash = result.get('Hash')
                        
                        if ipfs_hash:
                            print(f"✅ File uploaded to IPFS: {ipfs_hash}")
                            return ipfs_hash
                        else:
                            raise Exception("No hash returned from IPFS")
                    else:
                        error_text = await response.text()
                        raise Exception(f"IPFS upload failed: {error_text}")
        
        except Exception as e:
            print(f"❌ Error uploading file to IPFS: {e}")
            raise
    
    async def upload_image(self, image_data: bytes, filename: str) -> str:
        """Upload image data to IPFS"""
        try:
            # Create IPFS add request
            url = f"{self.ipfs_api_url}/api/v0/add"
            
            # Create multipart form data
            data = aiohttp.FormData()
            data.add_field('file', image_data, filename=filename, content_type='image/jpeg')
            
            # Make request
            async with aiohttp.ClientSession() as session:
                headers = {}
                if self.auth_headers:
                    headers.update(self.auth_headers)
                
                async with session.post(url, data=data, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        ipfs_hash = result.get('Hash')
                        
                        if ipfs_hash:
                            print(f"✅ Image uploaded to IPFS: {ipfs_hash}")
                            return ipfs_hash
                        else:
                            raise Exception("No hash returned from IPFS")
                    else:
                        error_text = await response.text()
                        raise Exception(f"IPFS upload failed: {error_text}")
        
        except Exception as e:
            print(f"❌ Error uploading image to IPFS: {e}")
            raise
    
    async def retrieve_json(self, ipfs_hash: str) -> Dict[str, Any]:
        """Retrieve JSON data from IPFS"""
        try:
            url = f"{self.ipfs_api_url}/api/v0/cat?arg={ipfs_hash}"
            
            async with aiohttp.ClientSession() as session:
                headers = {}
                if self.auth_headers:
                    headers.update(self.auth_headers)
                
                async with session.post(url, headers=headers) as response:
                    if response.status == 200:
                        json_data = await response.json()
                        print(f"✅ JSON retrieved from IPFS: {ipfs_hash}")
                        return json_data
                    else:
                        error_text = await response.text()
                        raise Exception(f"IPFS retrieval failed: {error_text}")
        
        except Exception as e:
            print(f"❌ Error retrieving JSON from IPFS: {e}")
            raise
    
    async def retrieve_file(self, ipfs_hash: str) -> bytes:
        """Retrieve file content from IPFS"""
        try:
            url = f"{self.ipfs_api_url}/api/v0/cat?arg={ipfs_hash}"
            
            async with aiohttp.ClientSession() as session:
                headers = {}
                if self.auth_headers:
                    headers.update(self.auth_headers)
                
                async with session.post(url, headers=headers) as response:
                    if response.status == 200:
                        file_content = await response.read()
                        print(f"✅ File retrieved from IPFS: {ipfs_hash}")
                        return file_content
                    else:
                        error_text = await response.text()
                        raise Exception(f"IPFS retrieval failed: {error_text}")
        
        except Exception as e:
            print(f"❌ Error retrieving file from IPFS: {e}")
            raise
    
    def get_ipfs_url(self, ipfs_hash: str) -> str:
        """Get public URL for IPFS content"""
        return f"{self.ipfs_gateway_url}/{ipfs_hash}"
    
    async def pin_file(self, ipfs_hash: str) -> bool:
        """Pin file to prevent garbage collection"""
        try:
            url = f"{self.ipfs_api_url}/api/v0/pin/add?arg={ipfs_hash}"
            
            async with aiohttp.ClientSession() as session:
                headers = {}
                if self.auth_headers:
                    headers.update(self.auth_headers)
                
                async with session.post(url, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        pins = result.get('Pins', [])
                        
                        if pins:
                            print(f"✅ File pinned to IPFS: {ipfs_hash}")
                            return True
                        else:
                            return False
                    else:
                        error_text = await response.text()
                        print(f"❌ IPFS pin failed: {error_text}")
                        return False
        
        except Exception as e:
            print(f"❌ Error pinning file to IPFS: {e}")
            return False
    
    async def unpin_file(self, ipfs_hash: str) -> bool:
        """Unpin file"""
        try:
            url = f"{self.ipfs_api_url}/api/v0/pin/rm?arg={ipfs_hash}"
            
            async with aiohttp.ClientSession() as session:
                headers = {}
                if self.auth_headers:
                    headers.update(self.auth_headers)
                
                async with session.post(url, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        pins = result.get('Pins', [])
                        
                        if ipfs_hash not in [pin.get('Hash', '') for pin in pins]:
                            print(f"✅ File unpinned from IPFS: {ipfs_hash}")
                            return True
                        else:
                            return False
                    else:
                        error_text = await response.text()
                        print(f"❌ IPFS unpin failed: {error_text}")
                        return False
        
        except Exception as e:
            print(f"❌ Error unpinning file from IPFS: {e}")
            return False
    
    async def list_pinned_files(self) -> List[Dict[str, Any]]:
        """List all pinned files"""
        try:
            url = f"{self.ipfs_api_url}/api/v0/pin/ls"
            
            async with aiohttp.ClientSession() as session:
                headers = {}
                if self.auth_headers:
                    headers.update(self.auth_headers)
                
                async with session.post(url, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        pins = result.get('Keys', [])
                        
                        formatted_pins = []
                        for pin in pins:
                            formatted_pins.append({
                                'hash': pin.get('Hash'),
                                'name': pin.get('Name'),
                                'size': pin.get('Size'),
                                'type': pin.get('Type')
                            })
                        
                        return formatted_pins
                    else:
                        error_text = await response.text()
                        raise Exception(f"IPFS list pins failed: {error_text}")
        
        except Exception as e:
            print(f"❌ Error listing pinned files: {e}")
            return []
    
    async def upload_crop_quality_certificate(
        self, 
        crop_data: Dict[str, Any], 
        quality_analysis: Dict[str, Any],
        images: List[str] = None
    ) -> str:
        """Upload comprehensive crop quality certificate"""
        try:
            # Create certificate structure
            certificate = {
                "certificate_type": "crop_quality_certificate",
                "version": "1.0",
                "issued_date": datetime.utcnow().isoformat(),
                "issuer": "AgriTrust 360",
                "crop_data": crop_data,
                "quality_analysis": quality_analysis,
                "verification_method": "ai_computer_vision",
                "blockchain_verified": True,
                "images": images or []
            }
            
            # Add digital signature (simplified)
            certificate_content = json.dumps(certificate, sort_keys=True)
            signature = hashlib.sha256(certificate_content.encode()).hexdigest()
            certificate["digital_signature"] = signature
            
            # Upload to IPFS
            ipfs_hash = await self.upload_json(certificate)
            
            # Pin the certificate
            await self.pin_file(ipfs_hash)
            
            return ipfs_hash
        
        except Exception as e:
            print(f"❌ Error uploading crop quality certificate: {e}")
            raise
    
    async def upload_supply_chain_document(
        self, 
        batch_id: str, 
        event_data: Dict[str, Any],
        documents: List[Dict[str, Any]] = None
    ) -> str:
        """Upload supply chain documentation"""
        try:
            # Create supply chain document
            document = {
                "document_type": "supply_chain_event",
                "batch_id": batch_id,
                "event_data": event_data,
                "timestamp": datetime.utcnow().isoformat(),
                "documents": documents or [],
                "verification_status": "pending",
                "blockchain_integration": True
            }
            
            # Upload to IPFS
            ipfs_hash = await self.upload_json(document)
            
            # Pin the document
            await self.pin_file(ipfs_hash)
            
            return ipfs_hash
        
        except Exception as e:
            print(f"❌ Error uploading supply chain document: {e}")
            raise
    
    async def create_batch_digital_passport(
        self, 
        batch_id: str, 
        crop_data: Dict[str, Any],
        supply_chain_events: List[Dict[str, Any]],
        quality_certificates: List[str]
    ) -> str:
        """Create comprehensive digital passport for a batch"""
        try:
            # Create digital passport
            passport = {
                "document_type": "digital_passport",
                "batch_id": batch_id,
                "version": "1.0",
                "created_date": datetime.utcnow().isoformat(),
                "crop_data": crop_data,
                "supply_chain_events": supply_chain_events,
                "quality_certificates": quality_certificates,
                "total_events": len(supply_chain_events),
                "last_updated": datetime.utcnow().isoformat(),
                "verification_status": "complete",
                "blockchain_linked": True
            }
            
            # Calculate passport hash
            passport_content = json.dumps(passport, sort_keys=True)
            passport_hash = hashlib.sha256(passport_content.encode()).hexdigest()
            passport["passport_hash"] = passport_hash
            
            # Upload to IPFS
            ipfs_hash = await self.upload_json(passport)
            
            # Pin the passport
            await self.pin_file(ipfs_hash)
            
            return ipfs_hash
        
        except Exception as e:
            print(f"❌ Error creating digital passport: {e}")
            raise
    
    async def verify_document_integrity(self, ipfs_hash: str, expected_hash: str) -> bool:
        """Verify document integrity using hash"""
        try:
            # Retrieve document from IPFS
            document = await self.retrieve_json(ipfs_hash)
            
            # Calculate hash of retrieved document
            document_content = json.dumps(document, sort_keys=True)
            calculated_hash = hashlib.sha256(document_content.encode()).hexdigest()
            
            # Compare hashes
            is_valid = calculated_hash == expected_hash
            
            if is_valid:
                print(f"✅ Document integrity verified: {ipfs_hash}")
            else:
                print(f"❌ Document integrity compromised: {ipfs_hash}")
            
            return is_valid
        
        except Exception as e:
            print(f"❌ Error verifying document integrity: {e}")
            return False
    
    async def get_ipfs_stats(self) -> Dict[str, Any]:
        """Get IPFS node statistics"""
        try:
            url = f"{self.ipfs_api_url}/api/v0/stats/bw"
            
            async with aiohttp.ClientSession() as session:
                headers = {}
                if self.auth_headers:
                    headers.update(self.auth_headers)
                
                async with session.post(url, headers=headers) as response:
                    if response.status == 200:
                        stats = await response.json()
                        return {
                            "total_in": stats.get('TotalIn', 0),
                            "total_out": stats.get('TotalOut', 0),
                            "rate_in": stats.get('RateIn', 0),
                            "rate_out": stats.get('RateOut', 0)
                        }
                    else:
                        return {"error": "Failed to get IPFS stats"}
        
        except Exception as e:
            print(f"❌ Error getting IPFS stats: {e}")
            return {"error": str(e)}
    
    async def replicate_to_multiple_nodes(self, ipfs_hash: str, nodes: List[str]) -> Dict[str, bool]:
        """Replicate content to multiple IPFS nodes"""
        try:
            results = {}
            
            for node_url in nodes:
                try:
                    url = f"{node_url}/api/v0/pin/add?arg={ipfs_hash}"
                    
                    async with aiohttp.ClientSession() as session:
                        async with session.post(url) as response:
                            if response.status == 200:
                                results[node_url] = True
                            else:
                                results[node_url] = False
                
                except Exception as e:
                    print(f"❌ Failed to replicate to {node_url}: {e}")
                    results[node_url] = False
            
            return results
        
        except Exception as e:
            print(f"❌ Error replicating to multiple nodes: {e}")
            return {}
