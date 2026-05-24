// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title GovernanceContract — HederaNet on-chain governance
contract GovernanceContract is Ownable, ReentrancyGuard {
    struct Proposal {
        address proposer;
        string title;
        string description;
        uint256 votingStartTime;
        uint256 votingEndTime;
        uint256 quorumRequired;   // bps of total supply
        uint256 approvalThreshold; // bps
        ProposalStatus status;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 abstainVotes;
    }

    struct Vote {
        bool hasVoted;
        VoteChoice choice;
        uint256 votingPower;
    }

    enum ProposalStatus { Pending, Active, Passed, Rejected, Executed }
    enum VoteChoice { Yes, No, Abstain }

    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => mapping(address => Vote)) public votes;

    address public governanceToken;
    address public reputationContract;
    address public stakingContract;

    uint256 public constant DISCUSSION_PERIOD = 2 days;
    uint256 public constant MIN_REPUTATION = 50;
    uint256 public constant TOTAL_SUPPLY = 600_000_000 * 10**8;

    event ProposalCreated(bytes32 indexed proposalId, address indexed proposer, string title);
    event VoteCast(bytes32 indexed proposalId, address indexed voter, VoteChoice choice, uint256 votingPower);
    event ProposalFinalized(bytes32 indexed proposalId, ProposalStatus status);

    error ProposerNotEligible();
    error ProposalNotActive();
    error VotingNotStarted();
    error VotingEnded();
    error AlreadyVoted();
    error VotingStillActive();

    constructor(address _governanceToken, address _reputationContract) Ownable(msg.sender) {
        governanceToken = _governanceToken;
        reputationContract = _reputationContract;
    }

    function setStakingContract(address _staking) external onlyOwner {
        stakingContract = _staking;
    }

    function createProposal(
        string calldata title,
        string calldata description,
        uint256 votingPeriod,
        uint256 quorum,
        uint256 threshold
    ) external returns (bytes32 proposalId) {
        if (!_checkEligibility(msg.sender)) revert ProposerNotEligible();

        proposalId = keccak256(abi.encodePacked(msg.sender, title, block.timestamp));

        Proposal storage p = proposals[proposalId];
        p.proposer = msg.sender;
        p.title = title;
        p.description = description;
        p.votingStartTime = block.timestamp + DISCUSSION_PERIOD;
        p.votingEndTime = p.votingStartTime + votingPeriod;
        p.quorumRequired = quorum;
        p.approvalThreshold = threshold;
        p.status = ProposalStatus.Pending;

        emit ProposalCreated(proposalId, msg.sender, title);
    }

    function activateProposal(bytes32 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Pending, "Not pending");
        require(block.timestamp >= p.votingStartTime, "Discussion period not over");
        p.status = ProposalStatus.Active;
    }

    function castVote(bytes32 proposalId, VoteChoice choice) external nonReentrant {
        Proposal storage p = proposals[proposalId];

        if (p.status != ProposalStatus.Active) revert ProposalNotActive();
        if (block.timestamp < p.votingStartTime) revert VotingNotStarted();
        if (block.timestamp > p.votingEndTime) revert VotingEnded();
        if (votes[proposalId][msg.sender].hasVoted) revert AlreadyVoted();

        uint256 power = _calculateVotingPower(msg.sender);

        votes[proposalId][msg.sender] = Vote({ hasVoted: true, choice: choice, votingPower: power });

        if (choice == VoteChoice.Yes) p.yesVotes += power;
        else if (choice == VoteChoice.No) p.noVotes += power;
        else p.abstainVotes += power;

        emit VoteCast(proposalId, msg.sender, choice, power);
    }

    function finalizeProposal(bytes32 proposalId) external {
        Proposal storage p = proposals[proposalId];

        if (p.status != ProposalStatus.Active) revert ProposalNotActive();
        if (block.timestamp <= p.votingEndTime) revert VotingStillActive();

        uint256 totalVotes = p.yesVotes + p.noVotes + p.abstainVotes;
        bool quorumReached = (totalVotes * 10000 / TOTAL_SUPPLY) >= p.quorumRequired;
        uint256 yesNoTotal = p.yesVotes + p.noVotes;
        bool approved = yesNoTotal > 0 && (p.yesVotes * 10000 / yesNoTotal) >= p.approvalThreshold;

        p.status = (quorumReached && approved) ? ProposalStatus.Passed : ProposalStatus.Rejected;
        emit ProposalFinalized(proposalId, p.status);
    }

    function getProposal(bytes32 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function hasVoted(bytes32 proposalId, address voter) external view returns (bool, VoteChoice) {
        Vote storage v = votes[proposalId][voter];
        return (v.hasVoted, v.choice);
    }

    function _calculateVotingPower(address voter) internal view returns (uint256) {
        (bool ok, bytes memory data) = reputationContract.staticcall(
            abi.encodeWithSignature("getReputationMultiplier(address)", voter)
        );
        uint256 multiplier = ok && data.length > 0 ? abi.decode(data, (uint256)) : 100;

        uint256 basePower = 1e8; // 1 vote base unit
        if (stakingContract != address(0)) {
            (bool ok2, bytes memory data2) = stakingContract.staticcall(
                abi.encodeWithSignature("getMultiplier(address)", voter)
            );
            if (ok2 && data2.length > 0) {
                uint256 stakeMultiplier = abi.decode(data2, (uint256));
                basePower = (basePower * stakeMultiplier) / 100;
            }
        }

        return (basePower * multiplier) / 100;
    }

    function _checkEligibility(address proposer) internal view returns (bool) {
        (bool ok, bytes memory data) = reputationContract.staticcall(
            abi.encodeWithSignature("getReputationScore(address)", proposer)
        );
        if (!ok || data.length == 0) return false;
        return abi.decode(data, (uint256)) >= MIN_REPUTATION;
    }
}
