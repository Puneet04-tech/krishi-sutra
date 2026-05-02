// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AgriTrust Insurance
 * @dev Parametric insurance system for agricultural risks
 */
contract AgriTrustInsurance is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    // Policy counter
    Counters.Counter private _policyIds;
    
    // Claim counter
    Counters.Counter private _claimIds;
    
    // Insurance policy structure
    struct InsurancePolicy {
        uint256 policyId;
        string farmerId;
        uint256 batchId;
        string policyType; // weather, price, comprehensive
        uint256 coverageAmount; // in wei
        uint256 premium; // in wei
        uint256 startDate;
        uint256 endDate;
        uint256 deductible; // in wei
        uint256 coveragePercentage; // in basis points (10000 = 100%)
        bool isActive;
        uint256 createdAt;
        string[] riskFactors;
        mapping(string => uint256) parametricTriggers; // trigger_type -> threshold
        uint256 totalClaims;
        uint256 totalPayouts;
    }
    
    // Insurance claim structure
    struct InsuranceClaim {
        uint256 claimId;
        uint256 policyId;
        string farmerId;
        string claimType; // weather_damage, price_drop, quality_issue
        uint256 requestedAmount;
        string description;
        uint256 incidentDate;
        string[] evidence;
        mapping(string => uint256) triggerData; // trigger_type -> actual_value
        string status; // pending, approved, rejected, paid
        uint256 approvedAmount;
        uint256 processedDate;
        string adjusterNotes;
        bool isValidated;
        uint256 validationScore; // 0-10000
    }
    
    // Weather data structure
    struct WeatherData {
        uint256 timestamp;
        string location;
        uint256 temperature; // in Celsius * 100
        uint256 rainfall; // in mm * 100
        uint256 humidity; // in percentage * 100
        uint256 windSpeed; // in km/h * 100
    }
    
    // Market data structure
    struct MarketData {
        uint256 timestamp;
        string cropType;
        uint256 price; // price per quintal in wei (with 2 decimal places)
        uint256 marketCap; // total market cap in wei
    }
    
    // Mappings
    mapping(uint256 => InsurancePolicy) public policies;
    mapping(string => uint256[]) public farmerPolicies; // farmerId -> policyIds
    mapping(uint256 => InsuranceClaim) public claims;
    mapping(string => uint256[]) public farmerClaims; // farmerId -> claimIds
    mapping(uint256 => uint256[]) public policyClaims; // policyId -> claimIds
    
    // Weather data storage
    mapping(string => WeatherData[]) public locationWeatherData; // location -> weather data
    mapping(string => MarketData[]) public cropMarketData; // cropType -> market data
    
    // Risk pool
    uint256 public riskPool;
    uint256 public totalPremiums;
    uint256 public totalPayouts;
    
    // Constants
    uint256 public constant COVERAGE_PRECISION = 10000; // 4 decimal places for percentages
    uint256 public constant PRICE_PRECISION = 100; // 2 decimal places for prices
    uint256 public constant TEMPERATURE_PRECISION = 100; // 2 decimal places for temperature
    uint256 public constant RAINFALL_PRECISION = 100; // 2 decimal places for rainfall
    uint256 public constant VALIDATION_THRESHOLD = 7000; // 70% validation score required
    
    // Events
    event PolicyCreated(
        uint256 indexed policyId,
        string indexed farmerId,
        uint256 indexed batchId,
        string policyType,
        uint256 coverageAmount,
        uint256 premium
    );
    event PremiumPaid(uint256 indexed policyId, uint256 amount);
    event ClaimFiled(
        uint256 indexed claimId,
        uint256 indexed policyId,
        string claimType,
        uint256 requestedAmount
    );
    event ClaimProcessed(
        uint256 indexed claimId,
        string status,
        uint256 approvedAmount,
        uint256 validationScore
    );
    event PayoutProcessed(uint256 indexed claimId, uint256 amount);
    event WeatherDataUpdated(string location, uint256 temperature, uint256 rainfall);
    event MarketDataUpdated(string cropType, uint256 price);
    
    constructor() {
        // Initialize contract
    }
    
    /**
     * @dev Create a new insurance policy
     * @param farmerId Farmer identifier
     * @param batchId Batch identifier
     * @param policyType Type of insurance (weather, price, comprehensive)
     * @param coverageAmount Coverage amount in wei
     * @param duration Policy duration in days
     * @param deductible Deductible amount in wei
     * @param coveragePercentage Coverage percentage (basis points)
     */
    function createPolicy(
        string memory farmerId,
        uint256 batchId,
        string memory policyType,
        uint256 coverageAmount,
        uint256 duration,
        uint256 deductible,
        uint256 coveragePercentage
    ) external nonReentrant returns (uint256) {
        require(coverageAmount > 0, "Coverage amount must be positive");
        require(duration >= 1 && duration <= 365, "Invalid duration");
        require(coveragePercentage <= COVERAGE_PRECISION, "Invalid coverage percentage");
        
        _policyIds.increment();
        uint256 newPolicyId = _policyIds.current();
        
        // Calculate premium based on risk assessment
        uint256 premium = calculatePremium(policyType, coverageAmount, duration);
        
        // Create policy
        InsurancePolicy storage policy = policies[newPolicyId];
        policy.policyId = newPolicyId;
        policy.farmerId = farmerId;
        policy.batchId = batchId;
        policy.policyType = policyType;
        policy.coverageAmount = coverageAmount;
        policy.premium = premium;
        policy.startDate = block.timestamp;
        policy.endDate = block.timestamp + (duration * 1 days);
        policy.deductible = deductible;
        policy.coveragePercentage = coveragePercentage;
        policy.isActive = true;
        policy.createdAt = block.timestamp;
        policy.totalClaims = 0;
        policy.totalPayouts = 0;
        
        // Set parametric triggers based on policy type
        setParametricTriggers(newPolicyId, policyType);
        
        // Update mappings
        farmerPolicies[farmerId].push(newPolicyId);
        
        emit PolicyCreated(newPolicyId, farmerId, batchId, policyType, coverageAmount, premium);
        
        return newPolicyId;
    }
    
    /**
     * @dev Pay premium for a policy
     * @param policyId Policy ID
     */
    function payPremium(uint256 policyId) external payable nonReentrant {
        InsurancePolicy storage policy = policies[policyId];
        
        require(policy.isActive, "Policy not active");
        require(block.timestamp <= policy.endDate, "Policy expired");
        require(msg.value >= policy.premium, "Insufficient premium");
        
        // Add to risk pool
        riskPool += msg.value;
        totalPremiums += msg.value;
        
        emit PremiumPaid(policyId, msg.value);
        
        // Refund excess payment
        if (msg.value > policy.premium) {
            payable(msg.sender).transfer(msg.value - policy.premium);
        }
    }
    
    /**
     * @dev File an insurance claim
     * @param policyId Policy ID
     * @param claimType Type of claim
     * @param requestedAmount Requested payout amount
     * @param description Claim description
     * @param incidentDate Date of incident
     * @param evidence Evidence IPFS hashes
     */
    function fileClaim(
        uint256 policyId,
        string memory claimType,
        uint256 requestedAmount,
        string memory description,
        uint256 incidentDate,
        string[] memory evidence
    ) external nonReentrant returns (uint256) {
        InsurancePolicy storage policy = policies[policyId];
        
        require(policy.isActive, "Policy not active");
        require(incidentDate >= policy.startDate && incidentDate <= policy.endDate, "Incident outside policy period");
        require(requestedAmount <= policy.coverageAmount, "Amount exceeds coverage");
        
        _claimIds.increment();
        uint256 newClaimId = _claimIds.current();
        
        // Create claim
        InsuranceClaim storage claim = claims[newClaimId];
        claim.claimId = newClaimId;
        claim.policyId = policyId;
        claim.farmerId = policy.farmerId;
        claim.claimType = claimType;
        claim.requestedAmount = requestedAmount;
        claim.description = description;
        claim.incidentDate = incidentDate;
        claim.evidence = evidence;
        claim.status = "pending";
        claim.approvedAmount = 0;
        claim.isValidated = false;
        claim.validationScore = 0;
        
        // Update mappings
        farmerClaims[policy.farmerId].push(newClaimId);
        policyClaims[policyId].push(newClaimId);
        
        emit ClaimFiled(newClaimId, policyId, claimType, requestedAmount);
        
        return newClaimId;
    }
    
    /**
     * @dev Process an insurance claim with parametric validation
     * @param claimId Claim ID
     */
    function processClaim(uint256 claimId) external nonReentrant {
        InsuranceClaim storage claim = claims[claimId];
        InsurancePolicy storage policy = policies[claim.policyId];
        
        require(keccak256(bytes(claim.status)) == keccak256(bytes("pending")), "Claim already processed");
        
        // Validate claim using parametric triggers
        (bool isValid, uint256 validationScore, uint256 payoutAmount) = validateParametricClaim(claimId);
        
        claim.isValidated = isValid;
        claim.validationScore = validationScore;
        claim.processedDate = block.timestamp;
        
        if (isValid && validationScore >= VALIDATION_THRESHOLD) {
            // Calculate approved amount
            uint256 maxPayout = (policy.coverageAmount * policy.coveragePercentage) / COVERAGE_PRECISION;
            uint256 deductibleAmount = min(payoutAmount, policy.deductible);
            claim.approvedAmount = min(payoutAmount - deductibleAmount, maxPayout);
            
            // Check if risk pool has sufficient funds
            if (riskPool >= claim.approvedAmount) {
                claim.status = "approved";
                
                // Process payout
                payable(msg.sender).transfer(claim.approvedAmount);
                
                // Update risk pool and policy
                riskPool -= claim.approvedAmount;
                totalPayouts += claim.approvedAmount;
                policy.totalClaims += 1;
                policy.totalPayouts += claim.approvedAmount;
                
                emit ClaimProcessed(claimId, "approved", claim.approvedAmount, validationScore);
                emit PayoutProcessed(claimId, claim.approvedAmount);
            } else {
                claim.status = "rejected";
                claim.adjusterNotes = "Insufficient risk pool funds";
                emit ClaimProcessed(claimId, "rejected", 0, validationScore);
            }
        } else {
            claim.status = "rejected";
            claim.adjusterNotes = "Parametric validation failed";
            emit ClaimProcessed(claimId, "rejected", 0, validationScore);
        }
    }
    
    /**
     * @dev Add weather data for parametric triggers
     * @param location Location identifier
     * @param temperature Temperature in Celsius * 100
     * @param rainfall Rainfall in mm * 100
     * @param humidity Humidity in percentage * 100
     * @param windSpeed Wind speed in km/h * 100
     */
    function addWeatherData(
        string memory location,
        uint256 temperature,
        uint256 rainfall,
        uint256 humidity,
        uint256 windSpeed
    ) external onlyOwner {
        WeatherData memory data = WeatherData({
            timestamp: block.timestamp,
            location: location,
            temperature: temperature,
            rainfall: rainfall,
            humidity: humidity,
            windSpeed: windSpeed
        });
        
        locationWeatherData[location].push(data);
        
        emit WeatherDataUpdated(location, temperature, rainfall);
    }
    
    /**
     * @dev Add market data for price insurance
     * @param cropType Crop type
     * @param price Price per quintal in wei (with 2 decimal places)
     * @param marketCap Total market cap in wei
     */
    function addMarketData(
        string memory cropType,
        uint256 price,
        uint256 marketCap
    ) external onlyOwner {
        MarketData memory data = MarketData({
            timestamp: block.timestamp,
            cropType: cropType,
            price: price,
            marketCap: marketCap
        });
        
        cropMarketData[cropType].push(data);
        
        emit MarketDataUpdated(cropType, price);
    }
    
    /**
     * @dev Get policies for a farmer
     * @param farmerId Farmer identifier
     */
    function getFarmerPolicies(string memory farmerId) external view returns (uint256[] memory) {
        return farmerPolicies[farmerId];
    }
    
    /**
     * @dev Get claims for a farmer
     * @param farmerId Farmer identifier
     */
    function getFarmerClaims(string memory farmerId) external view returns (uint256[] memory) {
        return farmerClaims[farmerId];
    }
    
    /**
     * @dev Get claims for a policy
     * @param policyId Policy ID
     */
    function getPolicyClaims(uint256 policyId) external view returns (uint256[] memory) {
        return policyClaims[policyId];
    }
    
    /**
     * @dev Get weather data for a location
     * @param location Location identifier
     */
    function getWeatherData(string memory location) external view returns (WeatherData[] memory) {
        return locationWeatherData[location];
    }
    
    /**
     * @dev Get market data for a crop type
     * @param cropType Crop type
     */
    function getMarketData(string memory cropType) external view returns (MarketData[] memory) {
        return cropMarketData[cropType];
    }
    
    /**
     * @dev Get insurance statistics
     */
    function getInsuranceStats() external view returns (
        uint256 totalPolicies,
        uint256 activePolicies,
        uint256 totalClaims,
        uint256 approvedClaims,
        uint256 totalPremiumAmount,
        uint256 totalPayoutAmount
    ) {
        totalPolicies = _policyIds.current();
        totalClaims = _claimIds.current();
        
        // Count active policies and approved claims
        for (uint256 i = 1; i <= totalPolicies; i++) {
            if (policies[i].isActive && block.timestamp <= policies[i].endDate) {
                activePolicies++;
            }
        }
        
        for (uint256 i = 1; i <= totalClaims; i++) {
            if (keccak256(bytes(claims[i].status)) == keccak256(bytes("approved"))) {
                approvedClaims++;
            }
        }
        
        totalPremiumAmount = totalPremiums;
        totalPayoutAmount = totalPayouts;
    }
    
    // Internal functions
    
    /**
     * @dev Calculate premium based on risk factors
     */
    function calculatePremium(
        string memory policyType,
        uint256 coverageAmount,
        uint256 duration
    ) internal pure returns (uint256) {
        uint256 baseRate = 500; // 5% base rate
        
        // Adjust for policy type
        if (keccak256(bytes(policyType)) == keccak256(bytes("weather"))) {
            baseRate = 600; // 6% for weather
        } else if (keccak256(bytes(policyType)) == keccak256(bytes("price"))) {
            baseRate = 400; // 4% for price
        } else if (keccak256(bytes(policyType)) == keccak256(bytes("comprehensive"))) {
            baseRate = 800; // 8% for comprehensive
        }
        
        // Adjust for duration
        uint256 durationFactor = (duration * 10000) / 365; // Convert to basis points
        
        return (coverageAmount * baseRate * durationFactor) / (10000 * 10000);
    }
    
    /**
     * @dev Set parametric triggers for a policy
     */
    function setParametricTriggers(uint256 policyId, string memory policyType) internal {
        InsurancePolicy storage policy = policies[policyId];
        
        if (keccak256(bytes(policyType)) == keccak256(bytes("weather"))) {
            policy.parametricTriggers["rainfall_threshold"] = 100 * RAINFALL_PRECISION; // 100mm
            policy.parametricTriggers["temperature_threshold"] = 4000 * TEMPERATURE_PRECISION; // 40°C
            policy.parametricTriggers["wind_speed_threshold"] = 6000; // 60 km/h
        } else if (keccak256(bytes(policyType)) == keccak256(bytes("price"))) {
            policy.parametricTriggers["price_drop_threshold"] = 2000; // 20%
            policy.parametricTriggers["price_floor"] = 1500 * PRICE_PRECISION; // ₹1500 per quintal
        }
    }
    
    /**
     * @dev Validate claim using parametric triggers
     */
    function validateParametricClaim(uint256 claimId) internal view returns (
        bool isValid,
        uint256 validationScore,
        uint256 payoutAmount
    ) {
        InsuranceClaim storage claim = claims[claimId];
        InsurancePolicy storage policy = policies[claim.policyId];
        
        isValid = false;
        validationScore = 0;
        payoutAmount = 0;
        
        if (keccak256(bytes(claim.claimType)) == keccak256(bytes("weather_damage"))) {
            // Validate weather triggers
            (bool weatherValid, uint256 weatherScore, uint256 weatherPayout) = validateWeatherClaim(claim);
            isValid = weatherValid;
            validationScore = weatherScore;
            payoutAmount = weatherPayout;
        } else if (keccak256(bytes(claim.claimType)) == keccak256(bytes("price_drop"))) {
            // Validate price triggers
            (bool priceValid, uint256 priceScore, uint256 pricePayout) = validatePriceClaim(claim);
            isValid = priceValid;
            validationScore = priceScore;
            payoutAmount = pricePayout;
        } else if (keccak256(bytes(claim.claimType)) == keccak256(bytes("quality_issue"))) {
            // Validate quality triggers (simplified)
            isValid = true;
            validationScore = 8000; // 80% validation score
            payoutAmount = claim.requestedAmount;
        }
    }
    
    /**
     * @dev Validate weather claim
     */
    function validateWeatherClaim(uint256 claimId) internal view returns (
        bool isValid,
        uint256 validationScore,
        uint256 payoutAmount
    ) {
        InsuranceClaim storage claim = claims[claimId];
        InsurancePolicy storage policy = policies[claim.policyId];
        
        // Get weather data around incident date
        WeatherData[] memory weatherData = locationWeatherData["default"]; // Simplified
        
        bool triggerMet = false;
        uint256 triggerCount = 0;
        
        for (uint256 i = 0; i < weatherData.length; i++) {
            // Check rainfall threshold
            if (weatherData[i].rainfall >= policy.parametricTriggers["rainfall_threshold"]) {
                triggerMet = true;
                triggerCount++;
            }
            
            // Check temperature threshold
            if (weatherData[i].temperature >= policy.parametricTriggers["temperature_threshold"]) {
                triggerMet = true;
                triggerCount++;
            }
            
            // Check wind speed threshold
            if (weatherData[i].windSpeed >= policy.parametricTriggers["wind_speed_threshold"]) {
                triggerMet = true;
                triggerCount++;
            }
        }
        
        if (triggerMet) {
            isValid = true;
            validationScore = min(triggerCount * 3000, COVERAGE_PRECISION); // Up to 100%
            payoutAmount = (claim.requestedAmount * validationScore) / COVERAGE_PRECISION;
        }
    }
    
    /**
     * @dev Validate price claim
     */
    function validatePriceClaim(uint256 claimId) internal view returns (
        bool isValid,
        uint256 validationScore,
        uint256 payoutAmount
    ) {
        InsuranceClaim storage claim = claims[claimId];
        InsurancePolicy storage policy = policies[claim.policyId];
        
        // Get market data around incident date
        MarketData[] memory marketData = cropMarketData["default"]; // Simplified
        
        bool triggerMet = false;
        uint256 lowestPrice = type(uint256).max;
        
        for (uint256 i = 0; i < marketData.length; i++) {
            if (marketData[i].price < lowestPrice) {
                lowestPrice = marketData[i].price;
            }
        }
        
        uint256 priceDropThreshold = policy.parametricTriggers["price_drop_threshold"];
        uint256 priceFloor = policy.parametricTriggers["price_floor"];
        
        if (lowestPrice < priceFloor) {
            triggerMet = true;
            isValid = true;
            validationScore = 9000; // 90% validation score
            payoutAmount = claim.requestedAmount;
        } else if (lowestPrice < (priceFloor * (10000 + priceDropThreshold)) / 10000) {
            triggerMet = true;
            isValid = true;
            validationScore = 7000; // 70% validation score
            payoutAmount = (claim.requestedAmount * 70) / 100;
        }
    }
    
    /**
     * @dev Utility function for minimum
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    /**
     * @dev Add funds to risk pool (owner only)
     */
    function addRiskPool() external payable onlyOwner {
        riskPool += msg.value;
    }
    
    /**
     * @dev Withdraw excess risk pool funds (owner only)
     */
    function withdrawExcessRiskPool(uint256 amount) external onlyOwner {
        require(amount <= riskPool, "Insufficient risk pool funds");
        require(riskPool - amount >= (totalPremiums * 10) / 100, "Must maintain 10% reserve");
        
        payable(owner()).transfer(amount);
        riskPool -= amount;
    }
}
