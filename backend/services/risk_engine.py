import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
import aiohttp
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

class RiskEngine:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_path = "models/risk_model.pkl"
        self.scaler_path = "models/scaler.pkl"
        self.load_models()
        
        # Risk weights for different factors
        self.risk_weights = {
            'weather': 0.35,
            'market': 0.25,
            'quality': 0.20,
            'farmer_history': 0.15,
            'location': 0.05
        }
        
        # API endpoints for external data
        self.weather_api_key = os.getenv("WEATHER_API_KEY")
        self.market_api_key = os.getenv("MARKET_API_KEY")
    
    def load_models(self):
        """Load pre-trained ML models"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print("✅ Risk assessment model loaded")
            
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)
                print("✅ Risk scaler loaded")
                
        except Exception as e:
            print(f"⚠️ Could not load models: {e}")
            self.initialize_default_model()
    
    def initialize_default_model(self):
        """Initialize default model if not available"""
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.scaler = StandardScaler()
    
    async def assess_crop_risk(self, batch_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive risk assessment for crop batch"""
        try:
            # Extract features for risk assessment
            features = await self.extract_risk_features(batch_data)
            
            # Calculate individual risk scores
            weather_risk = await self.calculate_weather_risk(batch_data)
            market_risk = await self.calculate_market_risk(batch_data)
            quality_risk = self.calculate_quality_risk(batch_data)
            farmer_risk = await self.calculate_farmer_risk(batch_data)
            location_risk = self.calculate_location_risk(batch_data)
            
            # Calculate overall risk score
            overall_risk = (
                weather_risk * self.risk_weights['weather'] +
                market_risk * self.risk_weights['market'] +
                quality_risk * self.risk_weights['quality'] +
                farmer_risk * self.risk_weights['farmer_history'] +
                location_risk * self.risk_weights['location']
            )
            
            # Determine loan eligibility
            loan_eligible = overall_risk < 70  # Risk threshold
            
            # Calculate maximum loan amount
            max_loan = await self.calculate_max_loan_amount(batch_data, overall_risk)
            
            # Recommended interest rate based on risk
            interest_rate = self.calculate_interest_rate(overall_risk)
            
            # Identify risk factors and mitigation suggestions
            risk_factors = self.identify_risk_factors(
                weather_risk, market_risk, quality_risk, farmer_risk, location_risk
            )
            
            mitigation_suggestions = self.generate_mitigation_suggestions(risk_factors)
            
            return {
                "overall_risk_score": round(overall_risk, 2),
                "weather_risk": round(weather_risk, 2),
                "market_risk": round(market_risk, 2),
                "quality_risk": round(quality_risk, 2),
                "farmer_risk": round(farmer_risk, 2),
                "location_risk": round(location_risk, 2),
                "loan_eligibility": loan_eligible,
                "max_loan_amount": max_loan,
                "recommended_interest_rate": round(interest_rate, 2),
                "risk_factors": risk_factors,
                "mitigation_suggestions": mitigation_suggestions,
                "assessment_date": datetime.utcnow().isoformat(),
                "features": features
            }
            
        except Exception as e:
            print(f"❌ Error in risk assessment: {e}")
            return {
                "overall_risk_score": 50.0,
                "loan_eligibility": False,
                "error": str(e)
            }
    
    async def extract_risk_features(self, batch_data: Dict[str, Any]) -> List[float]:
        """Extract features for ML model"""
        try:
            features = [
                batch_data.get('quantity', 0),
                batch_data.get('quality_score', 0),
                batch_data.get('carbon_credits', 0),
                batch_data.get('green_score', 0),
                len(batch_data.get('certifications', [])),
                self.get_crop_risk_factor(batch_data.get('crop_type', '')),
                self.get_seasonal_risk_factor(batch_data.get('planting_date')),
                self.get_location_risk_score(batch_data.get('location', '')),
            ]
            return features
        except Exception as e:
            print(f"❌ Error extracting features: {e}")
            return [0] * 8
    
    async def calculate_weather_risk(self, batch_data: Dict[str, Any]) -> float:
        """Calculate weather-related risk"""
        try:
            location = batch_data.get('location', '')
            crop_type = batch_data.get('crop_type', '')
            
            # Get historical weather data
            weather_data = await self.get_historical_weather(location)
            
            # Calculate weather risk based on:
            # 1. Historical rainfall variability
            # 2. Temperature extremes
            # 3. Extreme weather events frequency
            
            rainfall_risk = self.calculate_rainfall_risk(weather_data)
            temperature_risk = self.calculate_temperature_risk(weather_data)
            extreme_event_risk = self.calculate_extreme_event_risk(weather_data)
            
            weather_risk = (rainfall_risk + temperature_risk + extreme_event_risk) / 3
            
            # Adjust for crop type
            crop_weather_sensitivity = self.get_crop_weather_sensitivity(crop_type)
            weather_risk *= crop_weather_sensitivity
            
            return min(100, max(0, weather_risk))
            
        except Exception as e:
            print(f"❌ Error calculating weather risk: {e}")
            return 50.0
    
    async def calculate_market_risk(self, batch_data: Dict[str, Any]) -> float:
        """Calculate market-related risk"""
        try:
            crop_type = batch_data.get('crop_type', '')
            quantity = batch_data.get('quantity', 0)
            
            # Get market data
            market_data = await self.get_market_data(crop_type)
            
            # Calculate market risk based on:
            # 1. Price volatility
            # 2. Demand-supply gap
            # 3. Market trends
            
            price_volatility = market_data.get('price_volatility', 0.2)
            demand_supply_ratio = market_data.get('demand_supply_ratio', 1.0)
            market_trend = market_data.get('trend', 'stable')
            
            # Convert to risk score
            volatility_risk = price_volatility * 100
            demand_supply_risk = abs(1 - demand_supply_ratio) * 50
            
            trend_risk = 0
            if market_trend == 'declining':
                trend_risk = 30
            elif market_trend == 'volatile':
                trend_risk = 20
            
            market_risk = (volatility_risk + demand_supply_risk + trend_risk) / 3
            
            # Adjust for quantity (larger quantities have higher market risk)
            quantity_factor = min(1.5, 1 + (quantity / 1000))
            market_risk *= quantity_factor
            
            return min(100, max(0, market_risk))
            
        except Exception as e:
            print(f"❌ Error calculating market risk: {e}")
            return 50.0
    
    def calculate_quality_risk(self, batch_data: Dict[str, Any]) -> float:
        """Calculate quality-related risk"""
        try:
            quality_score = batch_data.get('quality_score', 50)
            quality_grade = batch_data.get('quality_grade', 'standard')
            
            # Base risk from quality score
            quality_risk = 100 - quality_score
            
            # Adjust for quality grade
            grade_risk = {
                'premium': -10,
                'standard': 0,
                'organic': -5
            }.get(quality_grade, 0)
            
            quality_risk += grade_risk
            
            # Consider quality consistency
            quality_consistency = batch_data.get('quality_consistency', 0.8)
            consistency_risk = (1 - quality_consistency) * 30
            
            quality_risk += consistency_risk
            
            return min(100, max(0, quality_risk))
            
        except Exception as e:
            print(f"❌ Error calculating quality risk: {e}")
            return 50.0
    
    async def calculate_farmer_risk(self, batch_data: Dict[str, Any]) -> float:
        """Calculate farmer-related risk"""
        try:
            farmer_id = batch_data.get('farmer_id', '')
            
            # Get farmer history and performance
            farmer_data = await self.get_farmer_history(farmer_id)
            
            # Calculate based on:
            # 1. Historical performance
            # 2. Default history
            # 3. Experience level
            # 4. Certification status
            
            performance_score = farmer_data.get('avg_performance', 70)
            default_rate = farmer_data.get('default_rate', 0.05)
            experience_years = farmer_data.get('experience_years', 5)
            certifications = farmer_data.get('certifications', [])
            
            # Performance risk
            performance_risk = 100 - performance_score
            
            # Default risk
            default_risk = default_rate * 500  # Scale up the impact
            
            # Experience risk (inverse relationship)
            experience_risk = max(0, 30 - experience_years * 2)
            
            # Certification benefit
            certification_benefit = min(20, len(certifications) * 5)
            
            farmer_risk = (performance_risk + default_risk + experience_risk - certification_benefit)
            
            return min(100, max(0, farmer_risk))
            
        except Exception as e:
            print(f"❌ Error calculating farmer risk: {e}")
            return 50.0
    
    def calculate_location_risk(self, batch_data: Dict[str, Any]) -> float:
        """Calculate location-based risk"""
        try:
            location = batch_data.get('location', '')
            
            # Location risk factors:
            # 1. Historical flood/drought probability
            # 2. Soil quality
            # 3. Infrastructure availability
            # 4. Political/economic stability
            
            location_risk = self.get_location_risk_score(location)
            
            return location_risk
            
        except Exception as e:
            print(f"❌ Error calculating location risk: {e}")
            return 50.0
    
    async def assess_insurance_risk(self, policy_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess risk for insurance policy"""
        try:
            batch_id = policy_data.get('batch_id', '')
            coverage_type = policy_data.get('policy_type', 'comprehensive')
            coverage_amount = policy_data.get('coverage_amount', 0)
            
            # Get batch data
            batch_data = await self.get_batch_data(batch_id)
            
            # Base risk assessment
            risk_assessment = await self.assess_crop_risk(batch_data)
            
            # Insurance-specific adjustments
            insurance_multiplier = {
                'weather': 1.2,
                'price': 1.1,
                'comprehensive': 1.0
            }.get(coverage_type, 1.0)
            
            # Calculate premium
            base_premium_rate = 0.05  # 5% base rate
            risk_adjusted_rate = base_premium_rate * (risk_assessment['overall_risk_score'] / 50)
            final_rate = risk_adjusted_rate * insurance_multiplier
            
            premium = coverage_amount * final_rate
            
            # Parametric triggers
            parametric_triggers = self.generate_parametric_triggers(
                coverage_type, batch_data
            )
            
            return {
                "premium": round(premium, 2),
                "premium_rate": round(final_rate * 100, 2),
                "base_risk_assessment": risk_assessment,
                "insurance_multiplier": insurance_multiplier,
                "parametric_triggers": parametric_triggers,
                "recommended_deductible": coverage_amount * 0.1,  # 10% deductible
                "coverage_recommendations": self.generate_coverage_recommendations(
                    risk_assessment, coverage_type
                )
            }
            
        except Exception as e:
            print(f"❌ Error assessing insurance risk: {e}")
            return {"error": str(e)}
    
    async def validate_parametric_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate parametric insurance claim"""
        try:
            policy_id = claim_data.get('policy_id', '')
            claim_type = claim_data.get('claim_type', '')
            incident_date = claim_data.get('incident_date')
            
            # Get policy details
            policy_data = await self.get_policy_data(policy_id)
            
            # Get parametric triggers
            triggers = policy_data.get('parametric_triggers', {})
            
            validation_result = {
                "valid": False,
                "confidence": 0.0,
                "trigger_met": False,
                "payout_percentage": 0.0,
                "evidence": {}
            }
            
            if claim_type == 'weather_damage':
                validation_result = await self.validate_weather_claim(
                    triggers, claim_data, incident_date
                )
            elif claim_type == 'price_drop':
                validation_result = await self.validate_price_claim(
                    triggers, claim_data, incident_date
                )
            elif claim_type == 'quality_issue':
                validation_result = await self.validate_quality_claim(
                    triggers, claim_data, incident_date
                )
            
            return validation_result
            
        except Exception as e:
            print(f"❌ Error validating parametric claim: {e}")
            return {"valid": False, "error": str(e)}
    
    # Helper methods
    def get_crop_risk_factor(self, crop_type: str) -> float:
        """Get risk factor for specific crop type"""
        risk_factors = {
            'wheat': 0.8,
            'rice': 1.2,
            'pulses': 1.0,
            'corn': 0.9,
            'cotton': 1.3,
            'sugarcane': 0.7
        }
        return risk_factors.get(crop_type.lower(), 1.0)
    
    def get_seasonal_risk_factor(self, planting_date: str) -> float:
        """Get seasonal risk factor"""
        if not planting_date:
            return 1.0
        
        try:
            date = datetime.fromisoformat(planting_date.replace('Z', '+00:00'))
            month = date.month
            
            # Higher risk for certain planting seasons
            seasonal_risk = {
                3: 1.2,  # March
                4: 1.1,  # April
                5: 0.9,  # May
                6: 1.3,  # June (monsoon onset)
                7: 1.4,  # July
                8: 1.3,  # August
                9: 1.0,  # September
                10: 0.8, # October
                11: 0.7, # November
            }.get(month, 1.0)
            
            return seasonal_risk
            
        except:
            return 1.0
    
    def get_location_risk_score(self, location: str) -> float:
        """Get location-based risk score"""
        # Simplified location risk assessment
        # In production, this would use detailed geographic data
        high_risk_areas = ['coastal', 'flood_prone', 'drought_prone']
        low_risk_areas = ['irrigated', 'stable']
        
        location_lower = location.lower()
        
        for area in high_risk_areas:
            if area in location_lower:
                return 70.0
        
        for area in low_risk_areas:
            if area in location_lower:
                return 30.0
        
        return 50.0
    
    def calculate_interest_rate(self, risk_score: float) -> float:
        """Calculate interest rate based on risk score"""
        base_rate = 8.0  # 8% base rate
        
        if risk_score < 20:
            return base_rate - 2.0  # 6%
        elif risk_score < 40:
            return base_rate - 1.0  # 7%
        elif risk_score < 60:
            return base_rate        # 8%
        elif risk_score < 80:
            return base_rate + 2.0  # 10%
        else:
            return base_rate + 4.0  # 12%
    
    async def calculate_max_loan_amount(self, batch_data: Dict[str, Any], risk_score: float) -> float:
        """Calculate maximum loan amount based on risk and collateral value"""
        try:
            # Base collateral value (70% of crop value)
            crop_value = batch_data.get('quantity', 0) * 2000  # Assuming ₹2000 per quintal
            base_collateral_value = crop_value * 0.7
            
            # Risk adjustment
            risk_multiplier = max(0.3, 1.0 - (risk_score / 100))
            
            max_loan = base_collateral_value * risk_multiplier
            
            return round(max_loan, 2)
            
        except Exception as e:
            print(f"❌ Error calculating max loan amount: {e}")
            return 0.0
    
    def identify_risk_factors(self, *risk_scores) -> List[str]:
        """Identify main risk factors"""
        factors = []
        risk_names = ['Weather', 'Market', 'Quality', 'Farmer', 'Location']
        
        for i, score in enumerate(risk_scores):
            if score > 60:
                factors.append(f"High {risk_names[i]} Risk")
            elif score > 40:
                factors.append(f"Moderate {risk_names[i]} Risk")
        
        return factors
    
    def generate_mitigation_suggestions(self, risk_factors: List[str]) -> List[str]:
        """Generate risk mitigation suggestions"""
        suggestions = []
        
        for factor in risk_factors:
            if 'Weather' in factor:
                suggestions.extend([
                    "Consider weather insurance coverage",
                    "Implement irrigation backup systems",
                    "Monitor weather forecasts regularly"
                ])
            elif 'Market' in factor:
                suggestions.extend([
                    "Consider forward contracts",
                    "Diversify crop portfolio",
                    "Monitor market trends"
                ])
            elif 'Quality' in factor:
                suggestions.extend([
                    "Implement quality control measures",
                    "Get organic certification",
                    "Use improved storage facilities"
                ])
            elif 'Farmer' in factor:
                suggestions.extend([
                    "Build credit history",
                    "Get agricultural training",
                    "Join farmer cooperatives"
                ])
            elif 'Location' in factor:
                suggestions.extend([
                    "Improve farm infrastructure",
                    "Consider crop relocation",
                    "Implement flood control measures"
                ])
        
        return list(set(suggestions))  # Remove duplicates
    
    # Placeholder methods for external data
    async def get_historical_weather(self, location: str) -> Dict[str, Any]:
        """Get historical weather data"""
        # In production, integrate with weather APIs
        return {
            "avg_rainfall": 800,
            "rainfall_variance": 200,
            "avg_temperature": 25,
            "temperature_variance": 5,
            "extreme_events": 2
        }
    
    async def get_market_data(self, crop_type: str) -> Dict[str, Any]:
        """Get market data for crop"""
        # In production, integrate with market APIs
        return {
            "price_volatility": 0.15,
            "demand_supply_ratio": 1.1,
            "trend": "stable"
        }
    
    async def get_farmer_history(self, farmer_id: str) -> Dict[str, Any]:
        """Get farmer historical data"""
        # In production, query database
        return {
            "avg_performance": 75,
            "default_rate": 0.02,
            "experience_years": 8,
            "certifications": ["organic", "good_agricultural_practices"]
        }
    
    async def get_batch_data(self, batch_id: str) -> Dict[str, Any]:
        """Get batch data"""
        # In production, query database
        return {}
    
    async def get_policy_data(self, policy_id: str) -> Dict[str, Any]:
        """Get policy data"""
        # In production, query database
        return {}
    
    def generate_parametric_triggers(self, coverage_type: str, batch_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate parametric insurance triggers"""
        triggers = {}
        
        if coverage_type == 'weather':
            triggers = {
                "rainfall_threshold": 100,  # mm
                "temperature_threshold": 40,  # °C
                "wind_speed_threshold": 60   # km/h
            }
        elif coverage_type == 'price':
            triggers = {
                "price_drop_threshold": 20,  # % drop
                "price_floor": 1500         # ₹ per quintal
            }
        
        return triggers
    
    def generate_coverage_recommendations(self, risk_assessment: Dict[str, Any], coverage_type: str) -> List[str]:
        """Generate coverage recommendations"""
        recommendations = []
        
        if risk_assessment['overall_risk_score'] > 60:
            recommendations.append("Consider comprehensive coverage")
        
        if risk_assessment['weather_risk'] > 50:
            recommendations.append("Add weather-specific riders")
        
        if risk_assessment['market_risk'] > 50:
            recommendations.append("Consider price protection")
        
        return recommendations
    
    async def validate_weather_claim(self, triggers: Dict[str, Any], claim_data: Dict[str, Any], incident_date: str) -> Dict[str, Any]:
        """Validate weather-based claim"""
        # In production, check actual weather data against triggers
        return {
            "valid": True,
            "confidence": 0.95,
            "trigger_met": True,
            "payout_percentage": 0.8,
            "evidence": {"rainfall": 150, "threshold": 100}
        }
    
    async def validate_price_claim(self, triggers: Dict[str, Any], claim_data: Dict[str, Any], incident_date: str) -> Dict[str, Any]:
        """Validate price-based claim"""
        # In production, check market price data
        return {
            "valid": True,
            "confidence": 0.90,
            "trigger_met": True,
            "payout_percentage": 0.7,
            "evidence": {"price_drop": 25, "threshold": 20}
        }
    
    async def validate_quality_claim(self, triggers: Dict[str, Any], claim_data: Dict[str, Any], incident_date: str) -> Dict[str, Any]:
        """Validate quality-based claim"""
        # In production, check quality inspection reports
        return {
            "valid": True,
            "confidence": 0.85,
            "trigger_met": True,
            "payout_percentage": 0.6,
            "evidence": {"quality_score": 30, "threshold": 50}
        }
