// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./helpers/HederaTokenService.sol";
import "./helpers/HederaResponseCodes.sol";

/// @title EnergyMarket
/// @notice Peer-to-peer energy trading with IoT oracle confirmation and dispute resolution
contract EnergyMarket is HederaTokenService, ReentrancyGuard, Ownable, Pausable {
    struct EnergyListing {
        address seller;
        uint256 energyAmount;   // kWh * 100 (2 decimal precision)
        uint256 pricePerKwh;    // HNET smallest unit
        uint256 expirationTime;
        bool isActive;
        bytes32 qualityHash;
    }

    struct Trade {
        bytes32 listingId;
        address buyer;
        address seller;
        uint256 energyAmount;
        uint256 totalCost;
        TradeStatus status;
        uint256 createdAt;
        uint256 confirmedAt;
        bool disputed;
    }

    enum TradeStatus { Pending, Confirmed, Disputed, Resolved, Cancelled }

    address public immutable energyCreditToken;
    address public immutable paymentToken;
    address public oracleContract;

    uint256 public platformFeeBps = 100; // 1%
    address public feeRecipient;

    uint256 public constant DISPUTE_WINDOW = 24 hours;
    uint256 public constant MIN_SLIPPAGE_BPS = 50; // 0.5%

    mapping(bytes32 => EnergyListing) public listings;
    mapping(bytes32 => Trade) public trades;
    mapping(address => uint256) public pendingWithdrawals;

    bytes32[] public activeListingIds;

    event EnergyListed(bytes32 indexed listingId, address indexed seller, uint256 amount, uint256 price);
    event ListingCancelled(bytes32 indexed listingId);
    event EnergyPurchased(bytes32 indexed listingId, bytes32 indexed tradeId, address indexed buyer, uint256 amount, uint256 totalCost);
    event DeliveryConfirmed(bytes32 indexed tradeId, uint256 confirmedAt);
    event DisputeRaised(bytes32 indexed tradeId, address indexed raiser);
    event DisputeResolved(bytes32 indexed tradeId, bool buyerFavored);
    event OracleUpdated(address indexed newOracle);

    error NotSeller();
    error NotBuyer();
    error ListingNotActive();
    error ListingExpired();
    error CannotBuyOwnListing();
    error SlippageExceeded();
    error TradeNotPending();
    error DisputeWindowExpired();
    error NotOracle();
    error ZeroAmount();

    modifier onlyOracle() {
        if (msg.sender != oracleContract) revert NotOracle();
        _;
    }

    constructor(
        address _energyToken,
        address _paymentToken,
        address _feeRecipient
    ) Ownable(msg.sender) {
        energyCreditToken = _energyToken;
        paymentToken = _paymentToken;
        feeRecipient = _feeRecipient;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracleContract = _oracle;
        emit OracleUpdated(_oracle);
    }

    function setPlatformFee(uint256 _bps) external onlyOwner {
        require(_bps <= 500, "Fee too high"); // max 5%
        platformFeeBps = _bps;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function createListing(
        uint256 amount,
        uint256 pricePerKwh,
        uint256 duration,
        bytes32 qualityProof
    ) external whenNotPaused returns (bytes32 listingId) {
        if (amount == 0) revert ZeroAmount();
        require(pricePerKwh > 0, "Price required");
        require(duration > 0 && duration <= 30 days, "Invalid duration");

        listingId = keccak256(abi.encodePacked(msg.sender, block.timestamp, amount, block.prevrandao));
        require(!listings[listingId].isActive, "ID collision");

        listings[listingId] = EnergyListing({
            seller: msg.sender,
            energyAmount: amount,
            pricePerKwh: pricePerKwh,
            expirationTime: block.timestamp + duration,
            isActive: true,
            qualityHash: qualityProof
        });

        activeListingIds.push(listingId);
        emit EnergyListed(listingId, msg.sender, amount, pricePerKwh);
    }

    function purchaseEnergy(
        bytes32 listingId,
        uint256 maxPricePerKwh
    ) external nonReentrant whenNotPaused returns (bytes32 tradeId) {
        EnergyListing storage listing = listings[listingId];

        if (!listing.isActive) revert ListingNotActive();
        if (block.timestamp >= listing.expirationTime) revert ListingExpired();
        if (msg.sender == listing.seller) revert CannotBuyOwnListing();

        // Slippage protection
        uint256 slippageLimit = (maxPricePerKwh * (10000 + MIN_SLIPPAGE_BPS)) / 10000;
        if (listing.pricePerKwh > slippageLimit) revert SlippageExceeded();

        uint256 totalCost = (listing.energyAmount * listing.pricePerKwh) / 100;
        uint256 platformFee = (totalCost * platformFeeBps) / 10000;
        uint256 sellerProceeds = totalCost - platformFee;

        // Payment token: buyer → seller (minus fee)
        int256 responseCode = transferToken(paymentToken, msg.sender, listing.seller, int64(uint64(sellerProceeds)));
        require(responseCode == HederaResponseCodes.SUCCESS, "Payment failed");

        // Platform fee
        if (platformFee > 0) {
            responseCode = transferToken(paymentToken, msg.sender, feeRecipient, int64(uint64(platformFee)));
            require(responseCode == HederaResponseCodes.SUCCESS, "Fee transfer failed");
        }

        // Energy credits: seller → buyer
        responseCode = transferToken(energyCreditToken, listing.seller, msg.sender, int64(uint64(listing.energyAmount)));
        require(responseCode == HederaResponseCodes.SUCCESS, "Energy transfer failed");

        listing.isActive = false;

        tradeId = keccak256(abi.encodePacked(listingId, msg.sender, block.timestamp));
        trades[tradeId] = Trade({
            listingId: listingId,
            buyer: msg.sender,
            seller: listing.seller,
            energyAmount: listing.energyAmount,
            totalCost: totalCost,
            status: TradeStatus.Pending,
            createdAt: block.timestamp,
            confirmedAt: 0,
            disputed: false
        });

        emit EnergyPurchased(listingId, tradeId, msg.sender, listing.energyAmount, totalCost);
    }

    function confirmDelivery(bytes32 tradeId) external onlyOracle {
        Trade storage trade = trades[tradeId];
        if (trade.status != TradeStatus.Pending) revert TradeNotPending();

        trade.status = TradeStatus.Confirmed;
        trade.confirmedAt = block.timestamp;
        emit DeliveryConfirmed(tradeId, block.timestamp);
    }

    function raiseDispute(bytes32 tradeId) external {
        Trade storage trade = trades[tradeId];
        if (msg.sender != trade.buyer && msg.sender != trade.seller) revert NotBuyer();
        if (trade.status != TradeStatus.Pending) revert TradeNotPending();
        if (block.timestamp > trade.createdAt + DISPUTE_WINDOW) revert DisputeWindowExpired();

        trade.status = TradeStatus.Disputed;
        trade.disputed = true;
        emit DisputeRaised(tradeId, msg.sender);
    }

    function resolveDispute(bytes32 tradeId, bool favorBuyer) external onlyOwner {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.Disputed, "Not disputed");

        trade.status = TradeStatus.Resolved;
        emit DisputeResolved(tradeId, favorBuyer);
    }

    function cancelListing(bytes32 listingId) external {
        EnergyListing storage listing = listings[listingId];
        if (!listing.isActive) revert ListingNotActive();
        if (msg.sender != listing.seller) revert NotSeller();

        listing.isActive = false;
        emit ListingCancelled(listingId);
    }

    function getListing(bytes32 listingId) external view returns (EnergyListing memory) {
        return listings[listingId];
    }

    function getTrade(bytes32 tradeId) external view returns (Trade memory) {
        return trades[tradeId];
    }
}
