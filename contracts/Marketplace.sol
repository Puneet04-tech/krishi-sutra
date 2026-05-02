// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AgriTrust Marketplace
 * @dev Decentralized marketplace for trading yield tokens
 */
contract AgriTrustMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    // Listing counter
    Counters.Counter private _listingIds;
    
    // Yield Token contract interface
    IERC721 public yieldTokenContract;
    
    // Listing structure
    struct Listing {
        uint256 listingId;
        uint256 tokenId;
        address seller;
        uint256 quantity; // in kg (with 3 decimal places)
        uint256 price; // price per kg in wei (with 2 decimal places)
        uint256 totalAmount; // total price = quantity * price
        bool isActive;
        uint256 created_at;
        uint256 expires_at;
        string description;
        uint256 minimum_bid;
        uint256 auction_end;
        bool is_auction;
        address highest_bidder;
        uint256 highest_bid;
    }
    
    // Purchase structure
    struct Purchase {
        uint256 purchaseId;
        uint256 listingId;
        address buyer;
        address seller;
        uint256 quantity;
        uint256 price;
        uint256 totalAmount;
        uint256 timestamp;
        bool isCompleted;
    }
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Purchase) public purchases;
    mapping(uint256 => uint256[]) public tokenListings; // tokenId -> listingIds
    mapping(address => uint256[]) public sellerListings; // seller -> listingIds
    mapping(address => uint256[]) public buyerPurchases; // buyer -> purchaseIds
    
    // Purchase counter
    Counters.Counter private _purchaseIds;
    
    // Constants
    uint256 public constant PRICE_PRECISION = 100; // 2 decimal places
    uint256 public constant QUANTITY_PRECISION = 1000; // 3 decimal places
    uint256 public constant MARKETPLACE_FEE = 250; // 2.5% fee (basis points)
    uint256 public constant MIN_LISTING_DURATION = 1 days;
    uint256 public constant MAX_LISTING_DURATION = 90 days;
    
    // Events
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 quantity,
        uint256 price
    );
    event ListingUpdated(uint256 indexed listingId, uint256 newPrice, uint256 newQuantity);
    event ListingCancelled(uint256 indexed listingId);
    event PurchaseExecuted(
        uint256 indexed listingId,
        uint256 indexed purchaseId,
        address indexed buyer,
        uint256 quantity,
        uint256 totalAmount
    );
    event BidPlaced(
        uint256 indexed listingId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionEnded(
        uint256 indexed listingId,
        address indexed winner,
        uint256 winningBid
    );
    
    constructor(address _yieldTokenContract) {
        yieldTokenContract = IERC721(_yieldTokenContract);
    }
    
    /**
     * @dev Create a new marketplace listing
     * @param tokenId Yield token ID
     * @param quantity Quantity to sell (with 3 decimal places)
     * @param price Price per kg in wei (with 2 decimal places)
     * @param duration Listing duration in seconds
     * @param description Listing description
     */
    function createListing(
        uint256 tokenId,
        uint256 quantity,
        uint256 price,
        uint256 duration,
        string memory description
    ) external nonReentrant returns (uint256) {
        require(yieldTokenContract.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(quantity > 0, "Quantity must be positive");
        require(price > 0, "Price must be positive");
        require(
            duration >= MIN_LISTING_DURATION && duration <= MAX_LISTING_DURATION,
            "Invalid duration"
        );
        
        // Check if token is not locked
        (,,,,,, bool isLocked,,,,) = IYieldToken(address(yieldTokenContract)).getYieldTokenInfo(tokenId);
        require(!isLocked, "Token is locked");
        
        _listingIds.increment();
        uint256 newListingId = _listingIds.current();
        
        uint256 totalAmount = (quantity * price) / PRICE_PRECISION;
        
        listings[newListingId] = Listing({
            listingId: newListingId,
            tokenId: tokenId,
            seller: msg.sender,
            quantity: quantity,
            price: price,
            totalAmount: totalAmount,
            isActive: true,
            created_at: block.timestamp,
            expires_at: block.timestamp + duration,
            description: description,
            minimum_bid: 0,
            auction_end: 0,
            is_auction: false,
            highest_bidder: address(0),
            highest_bid: 0
        });
        
        // Update mappings
        tokenListings[tokenId].push(newListingId);
        sellerListings[msg.sender].push(newListingId);
        
        emit ListingCreated(newListingId, tokenId, msg.sender, quantity, price);
        
        return newListingId;
    }
    
    /**
     * @dev Create an auction listing
     * @param tokenId Yield token ID
     * @param quantity Quantity to sell
     * @param startingPrice Starting price per kg
     * @param minimumBid Minimum bid increment
     * @param auctionDuration Auction duration
     * @param description Auction description
     */
    function createAuction(
        uint256 tokenId,
        uint256 quantity,
        uint256 startingPrice,
        uint256 minimumBid,
        uint256 auctionDuration,
        string memory description
    ) external nonReentrant returns (uint256) {
        require(yieldTokenContract.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(quantity > 0, "Quantity must be positive");
        require(startingPrice > 0, "Starting price must be positive");
        require(auctionDuration >= 1 hours && auctionDuration <= 7 days, "Invalid auction duration");
        
        (,,,,,, bool isLocked,,,,) = IYieldToken(address(yieldTokenContract)).getYieldTokenInfo(tokenId);
        require(!isLocked, "Token is locked");
        
        _listingIds.increment();
        uint256 newListingId = _listingIds.current();
        
        uint256 totalAmount = (quantity * startingPrice) / PRICE_PRECISION;
        
        listings[newListingId] = Listing({
            listingId: newListingId,
            tokenId: tokenId,
            seller: msg.sender,
            quantity: quantity,
            price: startingPrice,
            totalAmount: totalAmount,
            isActive: true,
            created_at: block.timestamp,
            expires_at: block.timestamp + auctionDuration,
            description: description,
            minimum_bid: minimumBid,
            auction_end: block.timestamp + auctionDuration,
            is_auction: true,
            highest_bidder: address(0),
            highest_bid: 0
        });
        
        tokenListings[tokenId].push(newListingId);
        sellerListings[msg.sender].push(newListingId);
        
        emit ListingCreated(newListingId, tokenId, msg.sender, quantity, startingPrice);
        
        return newListingId;
    }
    
    /**
     * @dev Execute a purchase from a listing
     * @param listingId Listing ID
     * @param quantity Quantity to purchase
     */
    function executePurchase(uint256 listingId, uint256 quantity) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expires_at, "Listing expired");
        require(quantity <= listing.quantity, "Insufficient quantity");
        require(!listing.is_auction, "Cannot purchase auction directly");
        
        uint256 totalAmount = (quantity * listing.price) / PRICE_PRECISION;
        require(msg.value >= totalAmount, "Insufficient payment");
        
        // Calculate marketplace fee
        uint256 marketplaceFee = (totalAmount * MARKETPLACE_FEE) / 10000;
        uint256 sellerAmount = totalAmount - marketplaceFee;
        
        // Transfer funds to seller
        payable(listing.seller).transfer(sellerAmount);
        
        // Update listing
        listing.quantity -= quantity;
        listing.totalAmount = (listing.quantity * listing.price) / PRICE_PRECISION;
        
        // Deactivate listing if fully sold
        if (listing.quantity == 0) {
            listing.isActive = false;
        }
        
        // Create purchase record
        _purchaseIds.increment();
        uint256 newPurchaseId = _purchaseIds.current();
        
        purchases[newPurchaseId] = Purchase({
            purchaseId: newPurchaseId,
            listingId: listingId,
            buyer: msg.sender,
            seller: listing.seller,
            quantity: quantity,
            price: listing.price,
            totalAmount: totalAmount,
            timestamp: block.timestamp,
            isCompleted: true
        });
        
        buyerPurchases[msg.sender].push(newPurchaseId);
        
        // Refund excess payment
        if (msg.value > totalAmount) {
            payable(msg.sender).transfer(msg.value - totalAmount);
        }
        
        emit PurchaseExecuted(listingId, newPurchaseId, msg.sender, quantity, totalAmount);
    }
    
    /**
     * @dev Place a bid on an auction
     * @param listingId Auction listing ID
     */
    function placeBid(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.isActive, "Auction not active");
        require(listing.is_auction, "Not an auction");
        require(block.timestamp <= listing.auction_end, "Auction ended");
        require(msg.value > listing.highest_bid, "Bid too low");
        
        // Minimum bid check
        if (listing.highest_bid > 0) {
            require(
                msg.value >= listing.highest_bid + listing.minimum_bid,
                "Bid increment too low"
            );
        }
        
        // Refund previous highest bidder
        if (listing.highest_bidder != address(0)) {
            payable(listing.highest_bidder).transfer(listing.highest_bid);
        }
        
        // Update highest bid
        listing.highest_bidder = msg.sender;
        listing.highest_bid = msg.value;
        
        emit BidPlaced(listingId, msg.sender, msg.value);
    }
    
    /**
     * @dev End an auction and transfer to winner
     * @param listingId Auction listing ID
     */
    function endAuction(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.is_auction, "Not an auction");
        require(block.timestamp > listing.auction_end, "Auction not ended");
        require(listing.isActive, "Auction already ended");
        
        if (listing.highest_bidder != address(0)) {
            // Calculate marketplace fee
            uint256 marketplaceFee = (listing.highest_bid * MARKETPLACE_FEE) / 10000;
            uint256 sellerAmount = listing.highest_bid - marketplaceFee;
            
            // Transfer funds to seller
            payable(listing.seller).transfer(sellerAmount);
            
            // Create purchase record
            _purchaseIds.increment();
            uint256 newPurchaseId = _purchaseIds.current();
            
            purchases[newPurchaseId] = Purchase({
                purchaseId: newPurchaseId,
                listingId: listingId,
                buyer: listing.highest_bidder,
                seller: listing.seller,
                quantity: listing.quantity,
                price: listing.highest_bid / listing.quantity,
                totalAmount: listing.highest_bid,
                timestamp: block.timestamp,
                isCompleted: true
            });
            
            buyerPurchases[listing.highest_bidder].push(newPurchaseId);
            
            emit AuctionEnded(listingId, listing.highest_bidder, listing.highest_bid);
            emit PurchaseExecuted(listingId, newPurchaseId, listing.highest_bidder, listing.quantity, listing.highest_bid);
        }
        
        // Deactivate auction
        listing.isActive = false;
    }
    
    /**
     * @dev Update listing price and quantity
     * @param listingId Listing ID
     * @param newPrice New price per kg
     * @param newQuantity New quantity
     */
    function updateListing(uint256 listingId, uint256 newPrice, uint256 newQuantity) external {
        Listing storage listing = listings[listingId];
        
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.isActive, "Listing not active");
        require(!listing.is_auction, "Cannot update auction");
        require(newPrice > 0, "Price must be positive");
        require(newQuantity > 0, "Quantity must be positive");
        
        listing.price = newPrice;
        listing.quantity = newQuantity;
        listing.totalAmount = (newQuantity * newPrice) / PRICE_PRECISION;
        
        emit ListingUpdated(listingId, newPrice, newQuantity);
    }
    
    /**
     * @dev Cancel a listing
     * @param listingId Listing ID
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        
        require(listing.seller == msg.sender, "Not listing owner");
        require(listing.isActive, "Listing not active");
        
        // Refund highest bidder if it's an auction
        if (listing.is_auction && listing.highest_bidder != address(0)) {
            payable(listing.highest_bidder).transfer(listing.highest_bid);
        }
        
        listing.isActive = false;
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @dev Get active listings
     */
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 totalListings = _listingIds.current();
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].isActive && block.timestamp <= listings[i].expires_at) {
                activeCount++;
            }
        }
        
        // Create array of active listings
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].isActive && block.timestamp <= listings[i].expires_at) {
                activeListings[index] = listings[i];
                index++;
            }
        }
        
        return activeListings;
    }
    
    /**
     * @dev Get listings for a specific token
     * @param tokenId Token ID
     */
    function getTokenListings(uint256 tokenId) external view returns (Listing[] memory) {
        uint256[] storage listingIds = tokenListings[tokenId];
        Listing[] memory tokenListingsArray = new Listing[](listingIds.length);
        
        for (uint256 i = 0; i < listingIds.length; i++) {
            tokenListingsArray[i] = listings[listingIds[i]];
        }
        
        return tokenListingsArray;
    }
    
    /**
     * @dev Get listings for a seller
     * @param seller Seller address
     */
    function getSellerListings(address seller) external view returns (Listing[] memory) {
        uint256[] storage listingIds = sellerListings[seller];
        Listing[] memory sellerListingsArray = new Listing[](listingIds.length);
        
        for (uint256 i = 0; i < listingIds.length; i++) {
            sellerListingsArray[i] = listings[listingIds[i]];
        }
        
        return sellerListingsArray;
    }
    
    /**
     * @dev Get purchases for a buyer
     * @param buyer Buyer address
     */
    function getBuyerPurchases(address buyer) external view returns (Purchase[] memory) {
        uint256[] storage purchaseIds = buyerPurchases[buyer];
        Purchase[] memory buyerPurchasesArray = new Purchase[](purchaseIds.length);
        
        for (uint256 i = 0; i < purchaseIds.length; i++) {
            buyerPurchasesArray[i] = purchases[purchaseIds[i]];
        }
        
        return buyerPurchasesArray;
    }
    
    /**
     * @dev Get marketplace statistics
     */
    function getMarketplaceStats() external view returns (
        uint256 totalListings,
        uint256 activeListings,
        uint256 totalPurchases,
        uint256 totalVolume
    ) {
        totalListings = _listingIds.current();
        
        // Count active listings
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].isActive && block.timestamp <= listings[i].expires_at) {
                activeListings++;
            }
        }
        
        totalPurchases = _purchaseIds.current();
        
        // Calculate total volume
        for (uint256 i = 1; i <= totalPurchases; i++) {
            totalVolume += purchases[i].totalAmount;
        }
    }
    
    /**
     * @dev Withdraw marketplace fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(owner()).transfer(balance);
    }
}

/**
 * @dev Interface for Yield Token contract
 */
interface IYieldToken {
    function getYieldTokenInfo(uint256 tokenId) external view returns (
        string memory farmerId,
        string memory cropType,
        uint256 quantity,
        uint256 qualityScore,
        string memory ipfsHash,
        bool isLocked,
        uint256 lockExpiration,
        address owner,
        uint256 carbonCredits,
        uint256 greenScore
    );
}
