// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title YieldToken
 * @dev ERC721 token representing tokenized agricultural yield
 * Each token represents a specific crop batch with quality and metadata
 */
contract YieldToken is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Token ID counter
    Counters.Counter private _tokenIds;
    
    // Token metadata structure
    struct TokenMetadata {
        uint256 tokenId;
        string farmerId;
        string cropType;
        uint256 quantity; // in kg (stored as 3 decimal places)
        uint256 qualityScore; // 0-100 (stored as 2 decimal places)
        string ipfsHash;
        uint256 timestamp;
        bool isLocked;
        uint256 lockExpiration;
        address owner;
        uint256 carbonCredits;
        uint256 greenScore;
    }
    
    // Supply chain event structure
    struct SupplyChainEvent {
        string eventType;
        string location;
        string handlerId;
        uint256 timestamp;
        bool verified;
        string blockchainTx;
    }
    
    // Farmer registry
    mapping(string => bool) public registeredFarmers;
    mapping(string => address) public farmerAddresses;
    mapping(address => string) public addressToFarmerId;
    
    // Token metadata storage
    mapping(uint256 => TokenMetadata) public tokenMetadata;
    
    // Supply chain events
    mapping(uint256 => SupplyChainEvent[]) public supplyChainEvents;
    mapping(string => SupplyChainEvent[]) public batchEvents; // batchId -> events
    
    // Locking mechanism
    mapping(uint256 => bool) public tokenLocked;
    mapping(uint256 => uint256) public lockExpiration;
    mapping(uint256 => address) public lockBeneficiary; // Who can unlock
    
    // Events
    event FarmerRegistered(string indexed farmerId, address indexed farmerAddress, string name, string location);
    event TokenMinted(uint256 indexed tokenId, string indexed farmerId, string cropType, uint256 quantity, uint256 qualityScore);
    event TokenTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event TokenLocked(uint256 indexed tokenId, address indexed locker, uint256 duration);
    event TokenUnlocked(uint256 indexed tokenId, address indexed unlocker);
    event SupplyChainEventAdded(uint256 indexed tokenId, string eventType, string location, string handlerId);
    event QualityUpdated(uint256 indexed tokenId, uint256 oldScore, uint256 newScore);
    event CarbonCreditsUpdated(uint256 indexed tokenId, uint256 credits);
    
    // Constants
    uint256 public constant QUALITY_PRECISION = 100; // 2 decimal places
    uint256 public constant QUANTITY_PRECISION = 1000; // 3 decimal places
    
    constructor() ERC721("AgriTrust Yield Token", "AYT") {
        // Contract deployment
    }
    
    /**
     * @dev Register a new farmer
     * @param farmerId Unique farmer identifier
     * @param name Farmer name
     * @param location Farmer location
     * @param rating Farmer rating (0-100, stored as integer)
     */
    function registerFarmer(
        string memory farmerId,
        string memory name,
        string memory location,
        uint256 rating
    ) external {
        require(!registeredFarmers[farmerId], "Farmer already registered");
        require(msg.sender != address(0), "Invalid address");
        
        registeredFarmers[farmerId] = true;
        farmerAddresses[farmerId] = msg.sender;
        addressToFarmerId[msg.sender] = farmerId;
        
        emit FarmerRegistered(farmerId, msg.sender, name, location);
    }
    
    /**
     * @dev Mint a new yield token
     * @param farmerId Farmer identifier
     * @param cropType Type of crop
     * @param quantity Quantity in kg (with 3 decimal places)
     * @param qualityScore Quality score 0-100 (with 2 decimal places)
     * @param ipfsHash IPFS hash containing metadata
     */
    function mintYieldToken(
        string memory farmerId,
        string memory cropType,
        uint256 quantity,
        uint256 qualityScore,
        string memory ipfsHash
    ) external nonReentrant returns (uint256) {
        require(registeredFarmers[farmerId], "Farmer not registered");
        require(farmerAddresses[farmerId] == msg.sender, "Not authorized");
        require(quantity > 0, "Quantity must be positive");
        require(qualityScore <= 100 * QUALITY_PRECISION, "Quality score too high");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Calculate initial carbon credits based on quality and quantity
        uint256 carbonCredits = calculateCarbonCredits(quantity, qualityScore);
        
        // Calculate green score
        uint256 greenScore = calculateGreenScore(qualityScore, carbonCredits);
        
        // Create token metadata
        tokenMetadata[newTokenId] = TokenMetadata({
            tokenId: newTokenId,
            farmerId: farmerId,
            cropType: cropType,
            quantity: quantity,
            qualityScore: qualityScore,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            isLocked: false,
            lockExpiration: 0,
            owner: msg.sender,
            carbonCredits: carbonCredits,
            greenScore: greenScore
        });
        
        // Mint the token
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, ipfsHash);
        
        emit TokenMinted(newTokenId, farmerId, cropType, quantity, qualityScore);
        emit CarbonCreditsUpdated(newTokenId, carbonCredits);
        
        return newTokenId;
    }
    
    /**
     * @dev Add supply chain event to token
     * @param tokenId Token ID
     * @param eventType Type of event
     * @param location Event location
     * @param handlerId Handler identifier
     */
    function addSupplyChainEvent(
        uint256 tokenId,
        string memory eventType,
        string memory location,
        string memory handlerId
    ) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");
        
        SupplyChainEvent memory event = SupplyChainEvent({
            eventType: eventType,
            location: location,
            handlerId: handlerId,
            timestamp: block.timestamp,
            verified: true,
            blockchainTx: ""
        });
        
        supplyChainEvents[tokenId].push(event);
        
        // Also add to batch events if we have batch ID
        string memory batchId = getBatchId(tokenId);
        if (bytes(batchId).length > 0) {
            batchEvents[batchId].push(event);
        }
        
        emit SupplyChainEventAdded(tokenId, eventType, location, handlerId);
    }
    
    /**
     * @dev Lock token as collateral
     * @param tokenId Token ID to lock
     * @param duration Lock duration in seconds
     */
    function lockToken(uint256 tokenId, uint256 duration) external nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!tokenLocked[tokenId], "Token already locked");
        
        tokenLocked[tokenId] = true;
        lockExpiration[tokenId] = block.timestamp + duration;
        lockBeneficiary[tokenId] = msg.sender;
        
        tokenMetadata[tokenId].isLocked = true;
        tokenMetadata[tokenId].lockExpiration = block.timestamp + duration;
        
        emit TokenLocked(tokenId, msg.sender, duration);
    }
    
    /**
     * @dev Unlock token
     * @param tokenId Token ID to unlock
     */
    function unlockToken(uint256 tokenId) external nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        require(tokenLocked[tokenId], "Token not locked");
        require(
            msg.sender == lockBeneficiary[tokenId] || 
            msg.sender == ownerOf(tokenId) ||
            msg.sender == owner(),
            "Not authorized to unlock"
        );
        require(block.timestamp >= lockExpiration[tokenId], "Lock not expired");
        
        tokenLocked[tokenId] = false;
        lockExpiration[tokenId] = 0;
        lockBeneficiary[tokenId] = address(0);
        
        tokenMetadata[tokenId].isLocked = false;
        tokenMetadata[tokenId].lockExpiration = 0;
        
        emit TokenUnlocked(tokenId, msg.sender);
    }
    
    /**
     * @dev Update quality score
     * @param tokenId Token ID
     * @param newQualityScore New quality score
     */
    function updateQualityScore(uint256 tokenId, uint256 newQualityScore) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender || msg.sender == owner(), "Not authorized");
        require(newQualityScore <= 100 * QUALITY_PRECISION, "Quality score too high");
        
        uint256 oldScore = tokenMetadata[tokenId].qualityScore;
        tokenMetadata[tokenId].qualityScore = newQualityScore;
        
        // Recalculate carbon credits and green score
        uint256 newCarbonCredits = calculateCarbonCredits(
            tokenMetadata[tokenId].quantity,
            newQualityScore
        );
        tokenMetadata[tokenId].carbonCredits = newCarbonCredits;
        
        uint256 newGreenScore = calculateGreenScore(newQualityScore, newCarbonCredits);
        tokenMetadata[tokenId].greenScore = newGreenScore;
        
        emit QualityUpdated(tokenId, oldScore, newQualityScore);
        emit CarbonCreditsUpdated(tokenId, newCarbonCredits);
    }
    
    /**
     * @dev Get comprehensive token information
     * @param tokenId Token ID
     */
    function getYieldTokenInfo(uint256 tokenId) external view returns (
        string memory farmerId,
        string memory cropType,
        uint256 quantity,
        uint256 qualityScore,
        string memory ipfsHash,
        bool isLocked,
        uint256 lockExp,
        address owner,
        uint256 carbonCredits,
        uint256 greenScore
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        TokenMetadata memory metadata = tokenMetadata[tokenId];
        
        return (
            metadata.farmerId,
            metadata.cropType,
            metadata.quantity,
            metadata.qualityScore,
            metadata.ipfsHash,
            metadata.isLocked,
            metadata.lockExpiration,
            metadata.owner,
            metadata.carbonCredits,
            metadata.greenScore
        );
    }
    
    /**
     * @dev Get supply chain events for a token
     * @param tokenId Token ID
     */
    function getSupplyChainEvents(uint256 tokenId) external view returns (SupplyChainEvent[] memory) {
        return supplyChainEvents[tokenId];
    }
    
    /**
     * @dev Get supply chain events for a batch
     * @param batchId Batch identifier
     */
    function getBatchSupplyChainEvents(string memory batchId) external view returns (SupplyChainEvent[] memory) {
        return batchEvents[batchId];
    }
    
    /**
     * @dev Check if token is locked
     * @param tokenId Token ID
     */
    function isTokenLocked(uint256 tokenId) external view returns (bool) {
        return tokenLocked[tokenId];
    }
    
    /**
     * @dev Get lock expiration time
     * @param tokenId Token ID
     */
    function getLockExpiration(uint256 tokenId) external view returns (uint256) {
        return lockExpiration[tokenId];
    }
    
    /**
     * @dev Override transfer function to check lock status
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(!tokenLocked[tokenId], "Token is locked and cannot be transferred");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Calculate carbon credits based on quantity and quality
     */
    function calculateCarbonCredits(uint256 quantity, uint256 qualityScore) internal pure returns (uint256) {
        // Base carbon credits: 1 credit per 1000kg
        uint256 baseCredits = (quantity * 1) / QUANTITY_PRECISION / 1000;
        
        // Quality multiplier: higher quality = more carbon credits
        uint256 qualityMultiplier = (qualityScore / QUALITY_PRECISION + 50) / 100;
        
        return baseCredits * qualityMultiplier;
    }
    
    /**
     * @dev Calculate green score based on quality and carbon credits
     */
    function calculateGreenScore(uint256 qualityScore, uint256 carbonCredits) internal pure returns (uint256) {
        // Green score is weighted average of quality and carbon efficiency
        uint256 qualityWeight = 70; // 70% weight to quality
        uint256 carbonWeight = 30;  // 30% weight to carbon credits
        
        uint256 qualityComponent = (qualityScore * qualityWeight) / 100;
        uint256 carbonComponent = (min(carbonCredits * 10, 100) * carbonWeight) / 100;
        
        return qualityComponent + carbonComponent;
    }
    
    /**
     * @dev Get batch ID from token (simplified - in production would be more sophisticated)
     */
    function getBatchId(uint256 tokenId) internal pure returns (string memory) {
        return string(abi.encodePacked("BATCH_", _toString(tokenId)));
    }
    
    /**
     * @dev Utility function to convert uint to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    /**
     * @dev Min function
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    /**
     * @dev Get total tokens minted
     */
    function getTotalTokens() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Get tokens owned by an address
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }
    
    /**
     * @dev Get tokens for a farmer
     */
    function getTokensByFarmer(string memory farmerId) external view returns (uint256[] memory) {
        address farmerAddress = farmerAddresses[farmerId];
        if (farmerAddress == address(0)) {
            return new uint256[](0);
        }
        
        return this.getTokensByOwner(farmerAddress);
    }
}
