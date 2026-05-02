import cv2
import numpy as np
from PIL import Image
import tensorflow as tf
from typing import Dict, List, Any, Tuple
import asyncio
import os
import json
from datetime import datetime

class CropQualityAnalyzer:
    def __init__(self):
        self.model = None
        self.class_labels = ['premium', 'standard', 'substandard']
        self.quality_thresholds = {
            'premium': 85,
            'standard': 65,
            'substandard': 0
        }
        self.load_model()
        
        # Defect detection parameters
        self.defect_detectors = {
            'discoloration': self.detect_discoloration,
            'damage': self.detect_damage,
            'foreign_matter': self.detect_foreign_matter,
            'moisture_issues': self.detect_moisture_issues,
            'size_variance': self.detect_size_variance
        }
    
    def load_model(self):
        """Load pre-trained crop quality model"""
        try:
            # Load TensorFlow model for crop quality classification
            model_path = "models/crop_quality_model.h5"
            if os.path.exists(model_path):
                self.model = tf.keras.models.load_model(model_path)
                print("✅ Crop quality model loaded successfully")
            else:
                print("⚠️ Model not found, using rule-based analysis")
                self.model = None
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.model = None
    
    async def analyze_crop_quality(self, image_path: str) -> Dict[str, Any]:
        """Analyze crop quality from image"""
        try:
            # Load and preprocess image
            image = await self.load_and_preprocess_image(image_path)
            if image is None:
                return {"error": "Failed to load image"}
            
            # Extract features
            features = await self.extract_quality_features(image)
            
            # Predict quality grade
            if self.model:
                quality_prediction = await self.predict_with_model(image)
            else:
                quality_prediction = await self.predict_with_rules(features)
            
            # Detect defects
            defects = await self.detect_defects(image, features)
            
            # Calculate quality score
            quality_score = self.calculate_quality_score(quality_prediction, defects)
            
            # Determine grade
            grade = self.determine_grade(quality_score)
            
            # Additional analysis
            moisture_content = await self.estimate_moisture_content(image)
            size_distribution = await self.analyze_size_distribution(image)
            color_analysis = await self.analyze_color_distribution(image)
            
            return {
                "success": True,
                "quality_score": quality_score,
                "grade": grade,
                "defects_detected": defects,
                "moisture_content": moisture_content,
                "size_distribution": size_distribution,
                "color_analysis": color_analysis,
                "confidence_score": quality_prediction.get('confidence', 0.8),
                "processing_time": features.get('processing_time', 0),
                "analysis_date": datetime.utcnow().isoformat(),
                "features": features
            }
            
        except Exception as e:
            print(f"❌ Error analyzing crop quality: {e}")
            return {"error": str(e), "success": False}
    
    async def load_and_preprocess_image(self, image_path: str) -> np.ndarray:
        """Load and preprocess image for analysis"""
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return None
            
            # Convert to RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Resize for processing
            image = cv2.resize(image, (512, 512))
            
            return image
            
        except Exception as e:
            print(f"❌ Error loading image: {e}")
            return None
    
    async def extract_quality_features(self, image: np.ndarray) -> Dict[str, Any]:
        """Extract visual features for quality assessment"""
        try:
            start_time = datetime.utcnow()
            
            features = {}
            
            # Color features
            features['color_histogram'] = self.calculate_color_histogram(image)
            features['dominant_colors'] = self.extract_dominant_colors(image)
            features['color_variance'] = self.calculate_color_variance(image)
            
            # Texture features
            features['texture_features'] = self.extract_texture_features(image)
            features['smoothness'] = self.calculate_smoothness(image)
            
            # Shape and size features
            features['size_distribution'] = await self.analyze_size_distribution(image)
            features['shape_regularity'] = self.calculate_shape_regularity(image)
            
            # Brightness and contrast
            features['brightness'] = np.mean(image)
            features['contrast'] = np.std(image)
            features['sharpness'] = self.calculate_sharpness(image)
            
            # Uniformity
            features['uniformity'] = self.calculate_uniformity(image)
            
            # Processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            features['processing_time'] = processing_time
            
            return features
            
        except Exception as e:
            print(f"❌ Error extracting features: {e}")
            return {}
    
    def calculate_color_histogram(self, image: np.ndarray) -> Dict[str, List[int]]:
        """Calculate color histogram for each channel"""
        histograms = {}
        for i, color in enumerate(['red', 'green', 'blue']):
            hist = cv2.calcHist([image], [i], None, [256], [0, 256])
            histograms[color] = hist.flatten().tolist()
        return histograms
    
    def extract_dominant_colors(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """Extract dominant colors using K-means clustering"""
        try:
            # Reshape image to be a list of pixels
            pixels = image.reshape(-1, 3)
            pixels = np.float32(pixels)
            
            # Define criteria and apply K-means
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
            _, labels, centers = cv2.kmeans(pixels, 5, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
            
            # Convert centers to integers
            centers = np.uint8(centers)
            
            dominant_colors = []
            for i, center in enumerate(centers):
                percentage = np.sum(labels == i) / len(labels) * 100
                dominant_colors.append({
                    'color': center.tolist(),
                    'percentage': percentage
                })
            
            return dominant_colors
            
        except Exception as e:
            print(f"❌ Error extracting dominant colors: {e}")
            return []
    
    def calculate_color_variance(self, image: np.ndarray) -> float:
        """Calculate color variance across the image"""
        return float(np.var(image))
    
    def extract_texture_features(self, image: np.ndarray) -> Dict[str, float]:
        """Extract texture features using GLCM"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Calculate GLCM
            distances = [1]
            angles = [0, 45, 90, 135]
            glcm = cv2.calcHist([gray], [0], None, [256], [0, 256])
            
            # Calculate texture features
            contrast = cv2.compareHist(glcm, glcm, cv2.HISTCMP_CORREL)
            homogeneity = cv2.compareHist(glcm, glcm, cv2.HISTCMP_INTERSECT)
            energy = cv2.compareHist(glcm, glcm, cv2.HISTCMP_BHATTACHARYA)
            
            return {
                'contrast': float(contrast),
                'homogeneity': float(homogeneity),
                'energy': float(energy)
            }
            
        except Exception as e:
            print(f"❌ Error extracting texture features: {e}")
            return {'contrast': 0, 'homogeneity': 0, 'energy': 0}
    
    def calculate_smoothness(self, image: np.ndarray) -> float:
        """Calculate image smoothness"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        return float(laplacian_var)
    
    def calculate_sharpness(self, image: np.ndarray) -> float:
        """Calculate image sharpness using Laplacian"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        return float(np.var(laplacian))
    
    def calculate_shape_regularity(self, image: np.ndarray) -> float:
        """Calculate shape regularity of objects in image"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Find contours
            contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                return 0.0
            
            # Calculate shape regularity
            regularity_scores = []
            for contour in contours:
                area = cv2.contourArea(contour)
                perimeter = cv2.arcLength(contour, True)
                
                if perimeter > 0:
                    circularity = 4 * np.pi * area / (perimeter * perimeter)
                    regularity_scores.append(circularity)
            
            return float(np.mean(regularity_scores)) if regularity_scores else 0.0
            
        except Exception as e:
            print(f"❌ Error calculating shape regularity: {e}")
            return 0.0
    
    def calculate_uniformity(self, image: np.ndarray) -> float:
        """Calculate color uniformity"""
        return float(1.0 - (np.std(image) / 255.0))
    
    async def predict_with_model(self, image: np.ndarray) -> Dict[str, Any]:
        """Predict quality using trained model"""
        try:
            # Preprocess for model
            processed_image = cv2.resize(image, (224, 224))
            processed_image = processed_image / 255.0
            processed_image = np.expand_dims(processed_image, axis=0)
            
            # Make prediction
            prediction = self.model.predict(processed_image)
            predicted_class = np.argmax(prediction[0])
            confidence = float(np.max(prediction[0]))
            
            return {
                'predicted_class': self.class_labels[predicted_class],
                'confidence': confidence,
                'probabilities': {
                    label: float(prob) for label, prob in zip(self.class_labels, prediction[0])
                }
            }
            
        except Exception as e:
            print(f"❌ Error predicting with model: {e}")
            return {'predicted_class': 'standard', 'confidence': 0.5}
    
    async def predict_with_rules(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Predict quality using rule-based approach"""
        try:
            score = 50  # Base score
            
            # Color-based scoring
            if features.get('color_variance', 100) < 50:
                score += 15
            
            # Brightness scoring
            brightness = features.get('brightness', 128)
            if 100 <= brightness <= 180:
                score += 10
            
            # Sharpness scoring
            if features.get('sharpness', 0) > 100:
                score += 10
            
            # Uniformity scoring
            if features.get('uniformity', 0) > 0.7:
                score += 15
            
            # Determine grade based on score
            if score >= 85:
                predicted_class = 'premium'
            elif score >= 65:
                predicted_class = 'standard'
            else:
                predicted_class = 'substandard'
            
            return {
                'predicted_class': predicted_class,
                'confidence': 0.7,
                'score': score
            }
            
        except Exception as e:
            print(f"❌ Error predicting with rules: {e}")
            return {'predicted_class': 'standard', 'confidence': 0.5}
    
    async def detect_defects(self, image: np.ndarray, features: Dict[str, Any]) -> List[str]:
        """Detect various defects in the crop"""
        defects = []
        
        for defect_name, detector in self.defect_detectors.items():
            try:
                if await detector(image, features):
                    defects.append(defect_name)
            except Exception as e:
                print(f"❌ Error detecting {defect_name}: {e}")
        
        return defects
    
    async def detect_discoloration(self, image: np.ndarray, features: Dict[str, Any]) -> bool:
        """Detect discoloration in crops"""
        try:
            # Convert to HSV for better color detection
            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            
            # Define range for unhealthy colors (yellow/brown spots)
            lower_unhealthy = np.array([20, 50, 50])
            upper_unhealthy = np.array([30, 255, 255])
            
            # Create mask for unhealthy colors
            mask = cv2.inRange(hsv, lower_unhealthy, upper_unhealthy)
            
            # Calculate percentage of unhealthy areas
            unhealthy_percentage = np.sum(mask > 0) / mask.size * 100
            
            return unhealthy_percentage > 5.0  # Threshold for discoloration
            
        except Exception as e:
            print(f"❌ Error detecting discoloration: {e}")
            return False
    
    async def detect_damage(self, image: np.ndarray, features: Dict[str, Any]) -> bool:
        """Detect physical damage"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Use edge detection to find damage
            edges = cv2.Canny(gray, 50, 150)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter for small, irregular shapes (indicating damage)
            damage_count = 0
            for contour in contours:
                area = cv2.contourArea(contour)
                if 10 < area < 100:  # Small areas
                    damage_count += 1
            
            return damage_count > 10  # Threshold for damage
            
        except Exception as e:
            print(f"❌ Error detecting damage: {e}")
            return False
    
    async def detect_foreign_matter(self, image: np.ndarray, features: Dict[str, Any]) -> bool:
        """Detect foreign matter"""
        try:
            # Use color segmentation to detect non-crop materials
            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            
            # Define range for foreign materials (dust, stones, etc.)
            lower_foreign = np.array([0, 0, 0])
            upper_foreign = np.array([20, 50, 50])
            
            mask = cv2.inRange(hsv, lower_foreign, upper_foreign)
            foreign_percentage = np.sum(mask > 0) / mask.size * 100
            
            return foreign_percentage > 3.0
            
        except Exception as e:
            print(f"❌ Error detecting foreign matter: {e}")
            return False
    
    async def detect_moisture_issues(self, image: np.ndarray, features: Dict[str, Any]) -> bool:
        """Detect moisture-related issues"""
        try:
            # Analyze texture for moisture indicators
            texture_features = features.get('texture_features', {})
            homogeneity = texture_features.get('homogeneity', 0)
            
            # Low homogeneity might indicate moisture issues
            return homogeneity < 0.3
            
        except Exception as e:
            print(f"❌ Error detecting moisture issues: {e}")
            return False
    
    async def detect_size_variance(self, image: np.ndarray, features: Dict[str, Any]) -> bool:
        """Detect size variance among crops"""
        try:
            size_dist = features.get('size_distribution', {})
            if not size_dist:
                return False
            
            sizes = list(size_dist.values())
            if len(sizes) < 2:
                return False
            
            # Calculate coefficient of variation
            mean_size = np.mean(sizes)
            std_size = np.std(sizes)
            cv = std_size / mean_size if mean_size > 0 else 0
            
            return cv > 0.3  # High variation indicates size issues
            
        except Exception as e:
            print(f"❌ Error detecting size variance: {e}")
            return False
    
    def calculate_quality_score(self, prediction: Dict[str, Any], defects: List[str]) -> float:
        """Calculate overall quality score"""
        try:
            # Base score from prediction
            if 'score' in prediction:
                base_score = prediction['score']
            else:
                predicted_class = prediction.get('predicted_class', 'standard')
                base_score = self.quality_thresholds.get(predicted_class, 50)
            
            # Adjust for defects
            defect_penalty = len(defects) * 5  # 5 points per defect
            
            # Adjust for confidence
            confidence = prediction.get('confidence', 0.8)
            confidence_adjustment = (confidence - 0.5) * 20  # Adjust based on confidence
            
            final_score = base_score - defect_penalty + confidence_adjustment
            
            return max(0, min(100, final_score))
            
        except Exception as e:
            print(f"❌ Error calculating quality score: {e}")
            return 50.0
    
    def determine_grade(self, quality_score: float) -> str:
        """Determine grade based on quality score"""
        if quality_score >= self.quality_thresholds['premium']:
            return 'premium'
        elif quality_score >= self.quality_thresholds['standard']:
            return 'standard'
        else:
            return 'substandard'
    
    async def estimate_moisture_content(self, image: np.ndarray) -> float:
        """Estimate moisture content from image"""
        try:
            # Use color and texture features to estimate moisture
            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            
            # Moisture affects saturation and brightness
            avg_saturation = np.mean(hsv[:, :, 1])
            avg_brightness = np.mean(hsv[:, :, 2])
            
            # Empirical formula for moisture estimation
            moisture = 50 - (avg_saturation / 255 * 30) - (avg_brightness / 255 * 20)
            
            return max(0, min(100, moisture))
            
        except Exception as e:
            print(f"❌ Error estimating moisture content: {e}")
            return 12.0  # Default moisture content
    
    async def analyze_size_distribution(self, image: np.ndarray) -> Dict[str, float]:
        """Analyze size distribution of crops"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Use watershed or contour analysis to identify individual crops
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Calculate sizes
            sizes = [cv2.contourArea(contour) for contour in contours]
            
            if not sizes:
                return {}
            
            # Calculate statistics
            sizes = np.array(sizes)
            
            return {
                'mean_size': float(np.mean(sizes)),
                'median_size': float(np.median(sizes)),
                'std_size': float(np.std(sizes)),
                'min_size': float(np.min(sizes)),
                'max_size': float(np.max(sizes))
            }
            
        except Exception as e:
            print(f"❌ Error analyzing size distribution: {e}")
            return {}
    
    async def analyze_color_distribution(self, image: np.ndarray) -> Dict[str, Any]:
        """Analyze color distribution"""
        try:
            # Calculate average colors
            avg_color = np.mean(image, axis=(0, 1))
            
            # Calculate color ranges
            color_ranges = {}
            for i, color in enumerate(['red', 'green', 'blue']):
                channel = image[:, :, i]
                color_ranges[color] = {
                    'min': float(np.min(channel)),
                    'max': float(np.max(channel)),
                    'mean': float(np.mean(channel)),
                    'std': float(np.std(channel))
                }
            
            return {
                'average_color': avg_color.tolist(),
                'color_ranges': color_ranges
            }
            
        except Exception as e:
            print(f"❌ Error analyzing color distribution: {e}")
            return {}
