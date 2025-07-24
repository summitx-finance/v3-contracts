// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import './interfaces/IGauge.sol';
import './interfaces/IVoter.sol';
import './interfaces/IERC20Minimal.sol';
import './libraries/TransferHelper.sol';
import './libraries/LowGasSafeMath.sol';

contract Gauge is IGauge {
    using LowGasSafeMath for uint256;

    address public immutable override pool;
    address public immutable override voter;
    
    bool public override isAlive;
    uint256 public override totalSupply;
    
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public userRewardPerTokenPaid;
    mapping(address => mapping(address => uint256)) public rewards;
    mapping(address => uint256) public rewardPerTokenStored;
    mapping(address => uint256) public override rewardRate;
    mapping(address => uint256) public rewardsDuration;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => uint256) public periodFinish;
    
    address[] public rewardTokens;
    mapping(address => bool) public isRewardToken;
    
    uint256 public constant DURATION = 7 days;

    modifier onlyVoter() {
        require(msg.sender == voter, 'NOT_AUTHORIZED');
        _;
    }

    modifier onlyAlive() {
        require(isAlive, 'GAUGE_KILLED');
        _;
    }

    modifier updateReward(address account) {
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            address token = rewardTokens[i];
            rewardPerTokenStored[token] = rewardPerToken(token);
            lastUpdateTime[token] = lastTimeRewardApplicable(token);
            if (account != address(0)) {
                rewards[account][token] = earned(account, token);
                userRewardPerTokenPaid[account][token] = rewardPerTokenStored[token];
            }
        }
        _;
    }

    constructor(address _pool, address _voter) {
        pool = _pool;
        voter = _voter;
        isAlive = true;
    }

    function lastTimeRewardApplicable(address token) public view returns (uint256) {
        return block.timestamp < periodFinish[token] ? block.timestamp : periodFinish[token];
    }

    function rewardPerToken(address token) public view override returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored[token];
        }
        return rewardPerTokenStored[token].add(
            lastTimeRewardApplicable(token)
                .sub(lastUpdateTime[token])
                .mul(rewardRate[token])
                .mul(1e18) / totalSupply
        );
    }

    function earned(address account, address token) public view override returns (uint256) {
        return (balanceOf[account]
            .mul(rewardPerToken(token).sub(userRewardPerTokenPaid[account][token]))
            / 1e18)
            .add(rewards[account][token]);
    }

    function deposit(uint256 amount) external override onlyAlive updateReward(msg.sender) {
        require(amount > 0, 'INVALID_AMOUNT');
        
        // Transfer tokens from user to gauge
        // In a full implementation, this would be LP tokens or position NFTs
        totalSupply = totalSupply.add(amount);
        balanceOf[msg.sender] = balanceOf[msg.sender].add(amount);
        
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external override onlyAlive updateReward(msg.sender) {
        require(amount > 0, 'INVALID_AMOUNT');
        require(balanceOf[msg.sender] >= amount, 'INSUFFICIENT_BALANCE');
        
        totalSupply = totalSupply.sub(amount);
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(amount);
        
        // Transfer tokens back to user
        // In a full implementation, this would be LP tokens or position NFTs
        
        emit Withdraw(msg.sender, amount);
    }

    function claimReward(address token) external override onlyAlive updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender][token];
        if (reward > 0) {
            rewards[msg.sender][token] = 0;
            TransferHelper.safeTransfer(token, msg.sender, reward);
            emit RewardClaimed(msg.sender, token, reward);
        }
    }

    function claimAllRewards() external override onlyAlive updateReward(msg.sender) {
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            address token = rewardTokens[i];
            uint256 reward = rewards[msg.sender][token];
            if (reward > 0) {
                rewards[msg.sender][token] = 0;
                TransferHelper.safeTransfer(token, msg.sender, reward);
                emit RewardClaimed(msg.sender, token, reward);
            }
        }
    }

    function notifyRewardAmount(address token, uint256 reward) external override onlyVoter updateReward(address(0)) {
        if (!isRewardToken[token]) {
            rewardTokens.push(token);
            isRewardToken[token] = true;
        }

        if (block.timestamp >= periodFinish[token]) {
            rewardRate[token] = reward / DURATION;
        } else {
            uint256 remaining = periodFinish[token].sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate[token]);
            rewardRate[token] = reward.add(leftover) / DURATION;
        }

        lastUpdateTime[token] = block.timestamp;
        periodFinish[token] = block.timestamp.add(DURATION);
        
        emit RewardAdded(token, reward);
    }

    function kill() external override onlyVoter {
        isAlive = false;
    }

    function revive() external override onlyVoter {
        isAlive = true;
    }

    function getRewardTokens() external view returns (address[] memory) {
        return rewardTokens;
    }
}