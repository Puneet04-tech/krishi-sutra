import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
import rasterio
from rasterio.plot import show
import geopandas as gpd
from shapely.geometry import Point, Polygon
import os
from dotenv import load_dotenv

load_dotenv()

class SatelliteDataService:
    def __init__(self):
        self.satellite_providers = {
            'sentinel': {
                'api_url': 'https://scihub.copernicus.eu/dhus/',
                'credentials': {'username': os.getenv('SENTINEL_USERNAME'), 'password': os.getenv('SENTINEL_PASSWORD')}
            },
            'landsat': {
                'api_url': 'https://earthexplorer.usgs.gov/inventory/json/',
                'api_key': os.getenv('LANDSAT_API_KEY')
            },
            'planet': {
                'api_url': 'https://api.planet.com/data/v1/',
                'api_key': os.getenv('PLANET_API_KEY')
            }
        }
        
        # Carbon sequestration factors (tons CO2 per hectare per year)
        self.carbon_factors = {
            'wheat': 2.5,
            'rice': 3.2,
            'pulses': 1.8,
            'corn': 3.5,
            'cotton': 2.0,
            'sugarcane': 4.0
        }
        
        # Green scoring parameters
        self.green_parameters = {
            'ndvi_weight': 0.4,
            'carbon_weight': 0.3,
            'biodiversity_weight': 0.2,
            'water_efficiency_weight': 0.1
        }
    
    async def calculate_carbon_credits(
        self, 
        location: str, 
        start_date: str, 
        end_date: str
    ) -> Dict[str, Any]:
        """Calculate carbon credits for farming practices"""
        try:
            # Parse dates
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            duration_days = (end_dt - start_dt).days
            
            # Get location coordinates
            coords = await self.geocode_location(location)
            if not coords:
                return {"error": "Invalid location"}
            
            # Get satellite data for the period
            satellite_data = await self.get_satellite_time_series(
                coords['lat'], coords['lng'], start_date, end_date
            )
            
            # Calculate various environmental metrics
            ndvi_trend = self.calculate_ndvi_trend(satellite_data)
            biomass_estimate = self.estimate_biomass(satellite_data)
            land_use_efficiency = self.calculate_land_use_efficiency(satellite_data)
            
            # Calculate carbon sequestration
            carbon_sequestration = await self.calculate_carbon_sequestration(
                satellite_data, duration_days
            )
            
            # Calculate green score
            green_score = self.calculate_green_score(
                ndvi_trend, carbon_sequestration, land_use_efficiency
            )
            
            # Determine carbon credits
            carbon_credits = self.determine_carbon_credits(
                carbon_sequestration, green_score, duration_days
            )
            
            # Generate sustainability insights
            insights = await self.generate_sustainability_insights(
                satellite_data, green_score
            )
            
            return {
                "success": True,
                "location": location,
                "coordinates": coords,
                "period": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "duration_days": duration_days
                },
                "satellite_data": {
                    "ndvi_trend": ndvi_trend,
                    "biomass_estimate": biomass_estimate,
                    "land_use_efficiency": land_use_efficiency,
                    "data_points": len(satellite_data)
                },
                "carbon_analysis": {
                    "carbon_sequestration": carbon_sequestration,
                    "carbon_credits": carbon_credits,
                    "green_score": green_score
                },
                "insights": insights,
                "calculation_date": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Error calculating carbon credits: {e}")
            return {"error": str(e)}
    
    async def get_satellite_time_series(
        self, 
        lat: float, 
        lng: float, 
        start_date: str, 
        end_date: str
    ) -> List[Dict[str, Any]]:
        """Get time series satellite data for a location"""
        try:
            # For demo purposes, generate synthetic data
            # In production, this would call actual satellite APIs
            
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            time_series = []
            current_date = start_dt
            
            while current_date <= end_dt:
                # Generate synthetic satellite data
                ndvi = self.generate_synthetic_ndvi(current_date)
                evi = self.generate_synthetic_evi(ndvi)
                lst = self.generate_synthetic_lst(current_date)
                soil_moisture = self.generate_synthetic_soil_moisture(current_date)
                
                time_series.append({
                    "date": current_date.isoformat(),
                    "ndvi": ndvi,
                    "evi": evi,
                    "land_surface_temperature": lst,
                    "soil_moisture": soil_moisture,
                    "cloud_cover": np.random.uniform(0, 20)  # Cloud cover percentage
                })
                
                # Move to next observation (every 8 days for Sentinel-2)
                current_date += timedelta(days=8)
            
            return time_series
            
        except Exception as e:
            print(f"❌ Error getting satellite time series: {e}")
            return []
    
    def generate_synthetic_ndvi(self, date: datetime) -> float:
        """Generate synthetic NDVI data based on crop growth cycle"""
        # Simulate crop growth cycle
        day_of_year = date.timetuple().tm_yday
        
        # NDVI follows a bell curve during growing season
        # Peak around day 200 (mid-July for Northern Hemisphere)
        peak_day = 200
        spread = 60
        
        ndvi = 0.8 * np.exp(-((day_of_year - peak_day) ** 2) / (2 * spread ** 2))
        ndvi += np.random.normal(0, 0.05)  # Add noise
        
        return max(0, min(1, ndvi))
    
    def generate_synthetic_evi(self, ndvi: float) -> float:
        """Generate EVI from NDVI"""
        # EVI is typically slightly lower than NDVI
        evi = ndvi * 0.9 + np.random.normal(0, 0.02)
        return max(0, min(1, evi))
    
    def generate_synthetic_lst(self, date: datetime) -> float:
        """Generate synthetic land surface temperature"""
        # Temperature varies seasonally
        day_of_year = date.timetuple().tm_yday
        
        # Sinusoidal temperature pattern
        base_temp = 25 + 10 * np.sin(2 * np.pi * (day_of_year - 80) / 365)
        lst = base_temp + np.random.normal(0, 2)
        
        return max(-10, min(50, lst))
    
    def generate_synthetic_soil_moisture(self, date: datetime) -> float:
        """Generate synthetic soil moisture data"""
        # Soil moisture varies with rainfall and evaporation
        base_moisture = 30 + 20 * np.sin(2 * np.pi * date.timetuple().tm_yday / 365)
        moisture = base_moisture + np.random.normal(0, 5)
        
        return max(0, min(100, moisture))
    
    def calculate_ndvi_trend(self, satellite_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate NDVI trend over time"""
        try:
            if len(satellite_data) < 2:
                return {"trend": 0, "correlation": 0}
            
            ndvi_values = [data['ndvi'] for data in satellite_data]
            
            # Calculate linear trend
            x = np.arange(len(ndvi_values))
            slope, intercept = np.polyfit(x, ndvi_values, 1)
            
            # Calculate correlation coefficient
            correlation = np.corrcoef(x, ndvi_values)[0, 1]
            
            return {
                "trend": float(slope),
                "correlation": float(correlation),
                "improving": slope > 0,
                "average_ndvi": float(np.mean(ndvi_values)),
                "max_ndvi": float(np.max(ndvi_values)),
                "min_ndvi": float(np.min(ndvi_values))
            }
            
        except Exception as e:
            print(f"❌ Error calculating NDVI trend: {e}")
            return {"trend": 0, "correlation": 0}
    
    def estimate_biomass(self, satellite_data: List[Dict[str, Any]]) -> float:
        """Estimate biomass from NDVI data"""
        try:
            if not satellite_data:
                return 0
            
            # Use average NDVI to estimate biomass
            avg_ndvi = np.mean([data['ndvi'] for data in satellite_data])
            
            # Empirical relationship between NDVI and biomass
            # Biomass (tons/ha) = a * exp(b * NDVI)
            a, b = 0.5, 3.0
            biomass = a * np.exp(b * avg_ndvi)
            
            return float(biomass)
            
        except Exception as e:
            print(f"❌ Error estimating biomass: {e}")
            return 0
    
    def calculate_land_use_efficiency(self, satellite_data: List[Dict[str, Any]]) -> float:
        """Calculate land use efficiency"""
        try:
            if not satellite_data:
                return 0
            
            # Efficiency based on NDVI stability and peak values
            ndvi_values = [data['ndvi'] for data in satellite_data]
            
            # Higher efficiency with stable, high NDVI
            avg_ndvi = np.mean(ndvi_values)
            ndvi_stability = 1 - np.std(ndvi_values)
            
            efficiency = avg_ndvi * ndvi_stability
            return float(efficiency)
            
        except Exception as e:
            print(f"❌ Error calculating land use efficiency: {e}")
            return 0
    
    async def calculate_carbon_sequestration(
        self, 
        satellite_data: List[Dict[str, Any]], 
        duration_days: int
    ) -> float:
        """Calculate carbon sequestration from satellite data"""
        try:
            # Base sequestration from biomass
            biomass = self.estimate_biomass(satellite_data)
            
            # Carbon content of biomass (approximately 50%)
            carbon_content = biomass * 0.5
            
            # Adjust for duration (convert to yearly rate)
            yearly_sequestration = carbon_content * (365 / duration_days)
            
            # Adjust for soil health indicators
            avg_soil_moisture = np.mean([data['soil_moisture'] for data in satellite_data])
            moisture_factor = avg_soil_moisture / 50  # Normalize to 50% as optimal
            
            final_sequestration = yearly_sequestration * moisture_factor
            
            return float(final_sequestration)
            
        except Exception as e:
            print(f"❌ Error calculating carbon sequestration: {e}")
            return 0
    
    def calculate_green_score(
        self, 
        ndvi_trend: Dict[str, Any], 
        carbon_sequestration: float, 
        land_use_efficiency: float
    ) -> float:
        """Calculate overall green score"""
        try:
            # Normalize each component to 0-100 scale
            ndvi_score = min(100, max(0, ndvi_trend['average_ndvi'] * 100))
            carbon_score = min(100, carbon_sequestration * 20)  # Scale carbon sequestration
            efficiency_score = min(100, land_use_efficiency * 100)
            biodiversity_score = 70  # Placeholder for biodiversity assessment
            
            # Calculate weighted average
            green_score = (
                ndvi_score * self.green_parameters['ndvi_weight'] +
                carbon_score * self.green_parameters['carbon_weight'] +
                efficiency_score * self.green_parameters['land_use_efficiency_weight'] +
                biodiversity_score * self.green_parameters['biodiversity_weight']
            )
            
            return float(green_score)
            
        except Exception as e:
            print(f"❌ Error calculating green score: {e}")
            return 50.0
    
    def determine_carbon_credits(
        self, 
        carbon_sequestration: float, 
        green_score: float, 
        duration_days: int
    ) -> float:
        """Determine carbon credits based on sequestration and practices"""
        try:
            # Base credits from sequestration
            base_credits = carbon_sequestration * (duration_days / 365)
            
            # Bonus for high green score
            green_bonus = (green_score / 100) * base_credits * 0.2  # 20% bonus max
            
            # Total credits
            total_credits = base_credits + green_bonus
            
            return float(total_credits)
            
        except Exception as e:
            print(f"❌ Error determining carbon credits: {e}")
            return 0
    
    async def generate_sustainability_insights(
        self, 
        satellite_data: List[Dict[str, Any]], 
        green_score: float
    ) -> List[str]:
        """Generate sustainability insights"""
        try:
            insights = []
            
            if green_score >= 80:
                insights.append("Excellent sustainable farming practices detected")
            elif green_score >= 60:
                insights.append("Good sustainable farming practices")
            else:
                insights.append("Room for improvement in sustainability")
            
            # Analyze NDVI trend
            if len(satellite_data) > 1:
                first_ndvi = satellite_data[0]['ndvi']
                last_ndvi = satellite_data[-1]['ndvi']
                
                if last_ndvi > first_ndvi * 1.1:
                    insights.append("Improving crop health over time")
                elif last_ndvi < first_ndvi * 0.9:
                    insights.append("Declining crop health - investigate causes")
                else:
                    insights.append("Stable crop health maintained")
            
            # Analyze water stress
            avg_moisture = np.mean([data['soil_moisture'] for data in satellite_data])
            if avg_moisture < 30:
                insights.append("Signs of water stress detected")
            elif avg_moisture > 70:
                insights.append("Adequate water availability")
            
            # Analyze temperature stress
            avg_temp = np.mean([data['land_surface_temperature'] for data in satellite_data])
            if avg_temp > 35:
                insights.append("High temperature stress detected")
            elif avg_temp < 15:
                insights.append("Low temperature may be limiting growth")
            
            return insights
            
        except Exception as e:
            print(f"❌ Error generating insights: {e}")
            return []
    
    async def geocode_location(self, location: str) -> Optional[Dict[str, float]]:
        """Convert location string to coordinates"""
        try:
            # For demo purposes, return some sample coordinates
            # In production, use geocoding API
            location_coords = {
                'ludhiana, punjab': {'lat': 30.9, 'lng': 75.85},
                'mumbai, maharashtra': {'lat': 19.07, 'lng': 72.87},
                'delhi': {'lat': 28.61, 'lng': 77.20},
                'bangalore': {'lat': 12.97, 'lng': 77.59},
                'kolkata': {'lat': 22.57, 'lng': 88.36}
            }
            
            location_lower = location.lower()
            for key, coords in location_coords.items():
                if key in location_lower:
                    return coords
            
            # Default coordinates if not found
            return {'lat': 20.59, 'lng': 78.96}  # Central India
            
        except Exception as e:
            print(f"❌ Error geocoding location: {e}")
            return None
    
    async def get_real_time_satellite_data(self, lat: float, lng: float) -> Dict[str, Any]:
        """Get real-time satellite data for a location"""
        try:
            # For demo purposes, return current synthetic data
            current_date = datetime.utcnow()
            
            return {
                "date": current_date.isoformat(),
                "coordinates": {"lat": lat, "lng": lng},
                "ndvi": self.generate_synthetic_ndvi(current_date),
                "evi": self.generate_synthetic_evi(self.generate_synthetic_ndvi(current_date)),
                "land_surface_temperature": self.generate_synthetic_lst(current_date),
                "soil_moisture": self.generate_synthetic_soil_moisture(current_date),
                "cloud_cover": np.random.uniform(0, 30),
                "data_source": "sentinel-2",
                "resolution": "10m"
            }
            
        except Exception as e:
            print(f"❌ Error getting real-time satellite data: {e}")
            return {}
    
    async def get_historical_satellite_imagery(
        self, 
        lat: float, 
        lng: float, 
        start_date: str, 
        end_date: str
    ) -> List[str]:
        """Get historical satellite imagery URLs"""
        try:
            # For demo purposes, return placeholder URLs
            # In production, this would return actual satellite imagery URLs
            
            image_urls = []
            current_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            while current_date <= end_dt:
                image_url = f"https://api.satellite.com/images/{lat}/{lng}/{current_date.strftime('%Y-%m-%d')}.png"
                image_urls.append({
                    "date": current_date.isoformat(),
                    "url": image_url,
                    "cloud_cover": np.random.uniform(0, 20)
                })
                
                current_date += timedelta(days=10)
            
            return image_urls
            
        except Exception as e:
            print(f"❌ Error getting historical imagery: {e}")
            return []
    
    async def analyze_crop_health_alerts(self, lat: float, lng: float) -> Dict[str, Any]:
        """Analyze crop health and generate alerts"""
        try:
            # Get recent satellite data
            recent_data = await self.get_real_time_satellite_data(lat, lng)
            
            alerts = []
            
            # NDVI-based alerts
            if recent_data.get('ndvi', 0) < 0.3:
                alerts.append({
                    "type": "poor_health",
                    "severity": "high",
                    "message": "Low vegetation health detected",
                    "recommendation": "Investigate nutrient deficiency or water stress"
                })
            elif recent_data.get('ndvi', 0) < 0.5:
                alerts.append({
                    "type": "moderate_health",
                    "severity": "medium",
                    "message": "Moderate vegetation health",
                    "recommendation": "Monitor crop conditions closely"
                })
            
            # Moisture-based alerts
            if recent_data.get('soil_moisture', 50) < 20:
                alerts.append({
                    "type": "water_stress",
                    "severity": "high",
                    "message": "Severe water stress detected",
                    "recommendation": "Immediate irrigation required"
                })
            elif recent_data.get('soil_moisture', 50) < 35:
                alerts.append({
                    "type": "moderate_stress",
                    "severity": "medium",
                    "message": "Moderate water stress",
                    "recommendation": "Consider irrigation"
                })
            
            # Temperature-based alerts
            if recent_data.get('land_surface_temperature', 25) > 40:
                alerts.append({
                    "type": "heat_stress",
                    "severity": "high",
                    "message": "High temperature stress",
                    "recommendation": "Provide shade or increase irrigation"
                })
            
            return {
                "location": {"lat": lat, "lng": lng},
                "analysis_date": datetime.utcnow().isoformat(),
                "current_conditions": recent_data,
                "alerts": alerts,
                "alert_count": len(alerts)
            }
            
        except Exception as e:
            print(f"❌ Error analyzing crop health alerts: {e}")
            return {"error": str(e)}
    
    async def predict_yield_potential(
        self, 
        lat: float, 
        lng: float, 
        crop_type: str
    ) -> Dict[str, Any]:
        """Predict yield potential based on satellite data"""
        try:
            # Get historical satellite data for the location
            end_date = datetime.utcnow().isoformat()
            start_date = (datetime.utcnow() - timedelta(days=365)).isoformat()
            
            satellite_data = await self.get_satellite_time_series(lat, lng, start_date, end_date)
            
            if not satellite_data:
                return {"error": "No satellite data available"}
            
            # Calculate yield potential factors
            avg_ndvi = np.mean([data['ndvi'] for data in satellite_data])
            peak_ndvi = np.max([data['ndvi'] for data in satellite_data])
            biomass = self.estimate_biomass(satellite_data)
            
            # Crop-specific yield factors
            yield_factors = {
                'wheat': 3.5,  # tons per hectare per unit NDVI
                'rice': 4.5,
                'pulses': 2.0,
                'corn': 5.0,
                'cotton': 2.5,
                'sugarcane': 8.0
            }
            
            crop_factor = yield_factors.get(crop_type.lower(), 3.0)
            
            # Calculate yield potential
            yield_potential = avg_ndvi * crop_factor * biomass / 10
            
            # Confidence based on data quality
            confidence = min(0.9, len(satellite_data) / 50)  # More data = higher confidence
            
            return {
                "crop_type": crop_type,
                "location": {"lat": lat, "lng": lng},
                "yield_potential": yield_potential,
                "unit": "tons_per_hectare",
                "confidence": confidence,
                "factors": {
                    "avg_ndvi": avg_ndvi,
                    "peak_ndvi": peak_ndvi,
                    "biomass_estimate": biomass
                },
                "recommendations": self.generate_yield_recommendations(yield_potential, confidence)
            }
            
        except Exception as e:
            print(f"❌ Error predicting yield potential: {e}")
            return {"error": str(e)}
    
    def generate_yield_recommendations(self, yield_potential: float, confidence: float) -> List[str]:
        """Generate recommendations based on yield potential"""
        recommendations = []
        
        if yield_potential > 5.0:
            recommendations.append("High yield potential - maintain current practices")
        elif yield_potential > 3.0:
            recommendations.append("Moderate yield potential - consider optimization")
        else:
            recommendations.append("Low yield potential - investigate limiting factors")
        
        if confidence < 0.5:
            recommendations.append("Low confidence - more satellite data needed")
        
        return recommendations
