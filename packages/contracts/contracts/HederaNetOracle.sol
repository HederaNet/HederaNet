// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title HederaNetOracle
/// @notice 3-of-5 multi-sig oracle for IoT confirmations (energy delivery, uptime, compute jobs).
///         Oracle nodes must stake to participate. Readings expire after 1 hour.
contract HederaNetOracle is Ownable {
    uint256 public constant REQUIRED_CONFIRMATIONS = 3;
    uint256 public constant MAX_ORACLES = 5;
    uint256 public constant READING_EXPIRY = 1 hours;
    uint256 public constant ORACLE_STAKE_REQUIREMENT = 50 ether; // 50 HBAR

    enum ReadingType { EnergyDelivery, NetworkUptime, ComputeJob }

    struct Reading {
        bytes32 id;
        ReadingType readingType;
        address deviceId;
        bytes32 dataHash;       // hash of the actual IoT payload
        uint256 value;          // e.g., kWh * 100, uptime bps
        uint256 submittedAt;
        uint256 confirmations;
        bool confirmed;
        mapping(address => bool) hasConfirmed;
    }

    struct OracleNode {
        bool isActive;
        uint256 stake;
        uint256 confirmationsGiven;
    }

    address[MAX_ORACLES] public oracleNodes;
    uint256 public activeOracleCount;
    mapping(address => OracleNode) public oracles;
    mapping(bytes32 => Reading) public readings;

    address public energyMarket;

    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event ReadingSubmitted(bytes32 indexed readingId, ReadingType readingType, address deviceId);
    event ReadingConfirmed(bytes32 indexed readingId, address indexed oracle);
    event ReadingFinalized(bytes32 indexed readingId, uint256 value);
    event EnergyMarketUpdated(address indexed market);

    error NotOracle();
    error ReadingExpired();
    error AlreadyConfirmed();
    error AlreadyFinalized();
    error InsufficientStake();
    error TooManyOracles();

    modifier onlyOracle() {
        if (!oracles[msg.sender].isActive) revert NotOracle();
        _;
    }

    constructor() Ownable(msg.sender) {}

    function setEnergyMarket(address _market) external onlyOwner {
        energyMarket = _market;
        emit EnergyMarketUpdated(_market);
    }

    function registerOracle(address oracle) external payable onlyOwner {
        if (activeOracleCount >= MAX_ORACLES) revert TooManyOracles();
        if (msg.value < ORACLE_STAKE_REQUIREMENT) revert InsufficientStake();

        oracles[oracle] = OracleNode({ isActive: true, stake: msg.value, confirmationsGiven: 0 });
        oracleNodes[activeOracleCount] = oracle;
        activeOracleCount++;
        emit OracleAdded(oracle);
    }

    function removeOracle(address oracle) external onlyOwner {
        require(oracles[oracle].isActive, "Not an oracle");
        oracles[oracle].isActive = false;
        activeOracleCount--;

        uint256 stake = oracles[oracle].stake;
        oracles[oracle].stake = 0;
        (bool ok,) = oracle.call{value: stake}('');
        require(ok, "Stake return failed");
        emit OracleRemoved(oracle);
    }

    function submitReading(
        ReadingType readingType,
        address deviceId,
        bytes32 dataHash,
        uint256 value
    ) external onlyOracle returns (bytes32 readingId) {
        readingId = keccak256(abi.encodePacked(readingType, deviceId, dataHash, block.timestamp));

        Reading storage r = readings[readingId];
        r.id = readingId;
        r.readingType = readingType;
        r.deviceId = deviceId;
        r.dataHash = dataHash;
        r.value = value;
        r.submittedAt = block.timestamp;
        r.confirmations = 1;
        r.hasConfirmed[msg.sender] = true;

        oracles[msg.sender].confirmationsGiven++;
        emit ReadingSubmitted(readingId, readingType, deviceId);
        emit ReadingConfirmed(readingId, msg.sender);

        if (r.confirmations >= REQUIRED_CONFIRMATIONS) {
            _finalizeReading(readingId);
        }
    }

    function confirmReading(bytes32 readingId) external onlyOracle {
        Reading storage r = readings[readingId];
        if (r.confirmed) revert AlreadyFinalized();
        if (block.timestamp > r.submittedAt + READING_EXPIRY) revert ReadingExpired();
        if (r.hasConfirmed[msg.sender]) revert AlreadyConfirmed();

        r.hasConfirmed[msg.sender] = true;
        r.confirmations++;
        oracles[msg.sender].confirmationsGiven++;
        emit ReadingConfirmed(readingId, msg.sender);

        if (r.confirmations >= REQUIRED_CONFIRMATIONS) {
            _finalizeReading(readingId);
        }
    }

    function _finalizeReading(bytes32 readingId) internal {
        Reading storage r = readings[readingId];
        r.confirmed = true;
        emit ReadingFinalized(readingId, r.value);

        // Notify energy market for delivery confirmations
        if (r.readingType == ReadingType.EnergyDelivery && energyMarket != address(0)) {
            (bool ok,) = energyMarket.call(
                abi.encodeWithSignature("confirmDelivery(bytes32)", r.dataHash)
            );
            // Soft failure — reading is still confirmed even if market call fails
            if (!ok) emit ReadingFinalized(readingId, 0);
        }
    }

    function isConfirmed(bytes32 readingId) external view returns (bool) {
        return readings[readingId].confirmed;
    }
}
