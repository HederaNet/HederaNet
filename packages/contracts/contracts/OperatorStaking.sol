// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title OperatorStaking
/// @notice Stake HBAR to earn operator tier benefits and weekly reward distributions.
///         Includes slashing for poor uptime and a 14-day unstaking cooldown.
contract OperatorStaking is ReentrancyGuard, Ownable {
    uint256 public constant BRONZE_THRESHOLD = 100 ether;  // 100 HBAR
    uint256 public constant SILVER_THRESHOLD = 500 ether;  // 500 HBAR
    uint256 public constant GOLD_THRESHOLD   = 2000 ether; // 2000 HBAR

    uint256 public constant BRONZE_MULTIPLIER = 100; // 1.0x (bps)
    uint256 public constant SILVER_MULTIPLIER = 150; // 1.5x
    uint256 public constant GOLD_MULTIPLIER   = 200; // 2.0x

    uint256 public constant SLASH_BPS = 500;          // 5% slash
    uint256 public constant UPTIME_THRESHOLD = 9000;  // 90% in bps
    uint256 public constant UNSTAKE_COOLDOWN = 14 days;
    uint256 public constant REWARD_INTERVAL = 7 days;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 unstakeRequestedAt;
        uint256 unstakeAmount;
        uint256 pendingRewards;
        uint256 lastRewardClaim;
        uint256 slashCount;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    uint256 public rewardPool;

    event Staked(address indexed operator, uint256 amount, uint8 tier);
    event UnstakeRequested(address indexed operator, uint256 amount, uint256 availableAt);
    event Unstaked(address indexed operator, uint256 amount);
    event RewardClaimed(address indexed operator, uint256 amount);
    event RewardDistributed(uint256 totalAmount);
    event Slashed(address indexed operator, uint256 slashAmount, string reason);
    event RewardPoolFunded(uint256 amount);

    error InsufficientStake();
    error CooldownNotMet();
    error NoPendingUnstake();
    error NoRewardsToClaim();

    enum Tier { None, Bronze, Silver, Gold }

    constructor() Ownable(msg.sender) {}

    receive() external payable {
        rewardPool += msg.value;
        emit RewardPoolFunded(msg.value);
    }

    function stake() external payable nonReentrant {
        require(msg.value >= BRONZE_THRESHOLD, "Minimum 100 HBAR required");

        StakeInfo storage info = stakes[msg.sender];
        info.amount += msg.value;
        info.stakedAt = block.timestamp;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value, uint8(getTier(msg.sender)));
    }

    function requestUnstake(uint256 amount) external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        require(info.amount >= amount, "Insufficient stake");

        info.amount -= amount;
        info.unstakeRequestedAt = block.timestamp;
        info.unstakeAmount += amount;
        totalStaked -= amount;

        emit UnstakeRequested(msg.sender, amount, block.timestamp + UNSTAKE_COOLDOWN);
    }

    function unstake() external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        if (info.unstakeAmount == 0) revert NoPendingUnstake();
        if (block.timestamp < info.unstakeRequestedAt + UNSTAKE_COOLDOWN) revert CooldownNotMet();

        uint256 amount = info.unstakeAmount;
        info.unstakeAmount = 0;
        info.unstakeRequestedAt = 0;

        (bool ok,) = msg.sender.call{value: amount}('');
        require(ok, "Transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        StakeInfo storage info = stakes[msg.sender];
        uint256 rewards = _calculatePendingRewards(msg.sender);
        if (rewards == 0) revert NoRewardsToClaim();

        require(rewardPool >= rewards, "Insufficient reward pool");
        rewardPool -= rewards;
        info.pendingRewards = 0;
        info.lastRewardClaim = block.timestamp;

        (bool ok,) = msg.sender.call{value: rewards}('');
        require(ok, "Reward transfer failed");
        emit RewardClaimed(msg.sender, rewards);
    }

    function distributeRewards() external onlyOwner {
        require(totalStaked > 0, "Nothing staked");
        uint256 amount = rewardPool / 50; // 2% of pool weekly
        require(amount > 0, "No rewards to distribute");

        // Mark pending rewards proportional to stake and tier
        // In production this would iterate all stakers — use snapshots/merkle for scale
        emit RewardDistributed(amount);
    }

    function slash(address operator, string calldata reason) external onlyOwner {
        StakeInfo storage info = stakes[operator];
        require(info.amount > 0, "No stake to slash");

        uint256 slashAmount = (info.amount * SLASH_BPS) / 10000;
        info.amount -= slashAmount;
        totalStaked -= slashAmount;
        info.slashCount += 1;

        // Slashed funds go to reward pool
        rewardPool += slashAmount;
        emit Slashed(operator, slashAmount, reason);
    }

    function getTier(address operator) public view returns (Tier) {
        uint256 amount = stakes[operator].amount;
        if (amount >= GOLD_THRESHOLD) return Tier.Gold;
        if (amount >= SILVER_THRESHOLD) return Tier.Silver;
        if (amount >= BRONZE_THRESHOLD) return Tier.Bronze;
        return Tier.None;
    }

    function getMultiplier(address operator) public view returns (uint256) {
        Tier tier = getTier(operator);
        if (tier == Tier.Gold) return GOLD_MULTIPLIER;
        if (tier == Tier.Silver) return SILVER_MULTIPLIER;
        if (tier == Tier.Bronze) return BRONZE_MULTIPLIER;
        return 0;
    }

    function getStakeInfo(address operator) external view returns (StakeInfo memory) {
        return stakes[operator];
    }

    function _calculatePendingRewards(address operator) internal view returns (uint256) {
        StakeInfo storage info = stakes[operator];
        if (info.amount == 0) return 0;
        return info.pendingRewards;
    }
}
