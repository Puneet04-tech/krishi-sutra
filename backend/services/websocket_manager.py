from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime

class WebSocketManager:
    def __init__(self):
        # Store active connections
        self.active_connections: List[WebSocket] = []
        
        # Store user-specific connections
        self.user_connections: Dict[str, List[WebSocket]] = {}
        
        # Store room-based connections
        self.room_connections: Dict[str, List[WebSocket]] = {}
        
        # Store connection metadata
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str = None, room: str = None):
        """Accept and store WebSocket connection"""
        await websocket.accept()
        
        # Add to active connections
        self.active_connections.append(websocket)
        
        # Store metadata
        metadata = {
            "connected_at": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "room": room,
            "last_ping": datetime.utcnow().isoformat()
        }
        self.connection_metadata[websocket] = metadata
        
        # Add to user connections if user_id provided
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)
        
        # Add to room connections if room provided
        if room:
            if room not in self.room_connections:
                self.room_connections[room] = []
            self.room_connections[room].append(websocket)
        
        print(f"✅ WebSocket connected. Total connections: {len(self.active_connections)}")
        
        # Send welcome message
        await self.send_personal_message(
            {"type": "connection", "message": "Connected to AgriTrust 360"}, 
            websocket
        )
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
            # Get metadata for cleanup
            metadata = self.connection_metadata.get(websocket, {})
            user_id = metadata.get("user_id")
            room = metadata.get("room")
            
            # Remove from user connections
            if user_id and user_id in self.user_connections:
                if websocket in self.user_connections[user_id]:
                    self.user_connections[user_id].remove(websocket)
                
                # Clean up empty user entries
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
            
            # Remove from room connections
            if room and room in self.room_connections:
                if websocket in self.room_connections[room]:
                    self.room_connections[room].remove(websocket)
                
                # Clean up empty room entries
                if not self.room_connections[room]:
                    del self.room_connections[room]
            
            # Remove metadata
            del self.connection_metadata[websocket]
        
        print(f"🔌 WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send message to specific WebSocket"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            print(f"❌ Error sending personal message: {e}")
            # Remove disconnected websocket
            self.disconnect(websocket)
    
    async def send_user_message(self, user_id: str, message: Dict[str, Any]):
        """Send message to all connections for a specific user"""
        if user_id in self.user_connections:
            disconnected = []
            for websocket in self.user_connections[user_id]:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    print(f"❌ Error sending user message: {e}")
                    disconnected.append(websocket)
            
            # Remove disconnected websockets
            for websocket in disconnected:
                self.disconnect(websocket)
    
    async def send_room_message(self, room: str, message: Dict[str, Any]):
        """Send message to all connections in a room"""
        if room in self.room_connections:
            disconnected = []
            for websocket in self.room_connections[room]:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    print(f"❌ Error sending room message: {e}")
                    disconnected.append(websocket)
            
            # Remove disconnected websockets
            for websocket in disconnected:
                self.disconnect(websocket)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all active connections"""
        disconnected = []
        for websocket in self.active_connections:
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"❌ Error broadcasting message: {e}")
                disconnected.append(websocket)
        
        # Remove disconnected websockets
        for websocket in disconnected:
            self.disconnect(websocket)
    
    async def broadcast_supply_chain_update(self, event_data: Dict[str, Any]):
        """Broadcast supply chain updates"""
        message = {
            "type": "supply_chain_update",
            "data": event_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_marketplace_update(self, listing_data: Dict[str, Any]):
        """Broadcast marketplace updates"""
        message = {
            "type": "marketplace_update",
            "data": listing_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_purchase_update(self, purchase_data: Dict[str, Any]):
        """Broadcast purchase updates"""
        message = {
            "type": "purchase_update",
            "data": purchase_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_price_alert(self, alert_data: Dict[str, Any]):
        """Broadcast price alerts"""
        message = {
            "type": "price_alert",
            "data": alert_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_weather_alert(self, alert_data: Dict[str, Any]):
        """Broadcast weather alerts"""
        message = {
            "type": "weather_alert",
            "data": alert_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message)
    
    async def send_loan_update(self, user_id: str, loan_data: Dict[str, Any]):
        """Send loan application updates to specific user"""
        message = {
            "type": "loan_update",
            "data": loan_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_user_message(user_id, message)
    
    async def send_insurance_update(self, user_id: str, insurance_data: Dict[str, Any]):
        """Send insurance updates to specific user"""
        message = {
            "type": "insurance_update",
            "data": insurance_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_user_message(user_id, message)
    
    async def send_quality_analysis_result(self, user_id: str, analysis_result: Dict[str, Any]):
        """Send AI quality analysis results"""
        message = {
            "type": "quality_analysis_result",
            "data": analysis_result,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_user_message(user_id, message)
    
    async def ping_connections(self):
        """Ping all connections to check connectivity"""
        message = {
            "type": "ping",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        disconnected = []
        for websocket in self.active_connections:
            try:
                await websocket.send_text(json.dumps(message))
                
                # Update last ping time
                if websocket in self.connection_metadata:
                    self.connection_metadata[websocket]["last_ping"] = datetime.utcnow().isoformat()
                    
            except Exception as e:
                print(f"❌ Error pinging connection: {e}")
                disconnected.append(websocket)
        
        # Remove disconnected websockets
        for websocket in disconnected:
            self.disconnect(websocket)
        
        return len(disconnected)
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        return {
            "total_connections": len(self.active_connections),
            "unique_users": len(self.user_connections),
            "active_rooms": len(self.room_connections),
            "connections_by_room": {
                room: len(connections) for room, connections in self.room_connections.items()
            }
        }
    
    def get_user_connections(self, user_id: str) -> int:
        """Get number of connections for a user"""
        return len(self.user_connections.get(user_id, []))
    
    def get_room_connections(self, room: str) -> int:
        """Get number of connections in a room"""
        return len(self.room_connections.get(room, []))
    
    async def cleanup_inactive_connections(self, max_inactive_minutes: int = 30):
        """Clean up inactive connections"""
        current_time = datetime.utcnow()
        disconnected = []
        
        for websocket, metadata in self.connection_metadata.items():
            last_ping = metadata.get("last_ping")
            if last_ping:
                last_ping_time = datetime.fromisoformat(last_ping)
                inactive_minutes = (current_time - last_ping_time).total_seconds() / 60
                
                if inactive_minutes > max_inactive_minutes:
                    disconnected.append(websocket)
        
        # Remove inactive connections
        for websocket in disconnected:
            print(f"🔌 Removing inactive connection")
            self.disconnect(websocket)
        
        return len(disconnected)
