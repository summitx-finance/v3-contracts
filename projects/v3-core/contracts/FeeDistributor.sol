// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import './interfaces/IFeeDistributor.sol';
import './interfaces/IGauge.sol';
import './interfaces/IERC20Minimal.sol';
import './libraries/TransferHelper.sol';
import './libraries/LowGasSafeMath.sol';

contract FeeDistributor is IFeeDistributor {
    using LowGasSafeMath for uint256;

    address public immutable override gauge;
    
    mapping(address => uint256) public override rewardRate;
    mapping(address => uint256) public rewardPerTokenStored;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => uint256) public periodFinish;
    mapping(address => mapping(address => uint256)) public userRewardPerTokenPaid;
    mapping(address => mapping(address => uint256)) public rewards;
    
    address[] private _rewardTokens;
    mapping(address => bool) private _isRewardToken;
    
    uint256 public constant DURATION = 7 days;

    modifier onlyGauge() {
        require(msg.sender == gauge, 'NOT_AUTHORIZED');
        _;
    }

    modifier updateReward(address account, address token) {
        rewardPerTokenStored[token] = rewardPerToken(token);
        lastUpdateTime[token] = lastTimeRewardApplicable(token);
        if (account != address(0)) {
            rewards[account][token] = earned(account, token);
            userRewardPerTokenPaid[account][token] = rewardPerTokenStored[token];
        }
        _;
    }

    constructor(address _gauge) {
        gauge = _gauge;
    }

    function lastTimeRewardApplicable(address token) public view returns (uint256) {
        return block.timestamp < periodFinish[token] ? block.timestamp : periodFinish[token];
    }

    function rewardPerToken(address token) public view override returns (uint256) {
        uint256 totalSupply = IGauge(gauge).totalSupply();
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
        uint256 balance = IGauge(gauge).balanceOf(account);
        return (balance
            .mul(rewardPerToken(token).sub(userRewardPerTokenPaid[account][token]))
            / 1e18)
            .add(rewards[account][token]);
    }

    function claimReward(address account, address token) external override onlyGauge updateReward(account, token) {
        uint256 reward = rewards[account][token];
        if (reward > 0) {
            rewards[account][token] = 0;
            TransferHelper.safeTransfer(token, account, reward);
            emit RewardPaid(account, token, reward);
        }
    }

    function notifyRewardAmount(address token, uint256 reward) external override updateReward(address(0), token) {
        require(reward > 0, 'INVALID_AMOUNT');
        
        if (!_isRewardToken[token]) {
            _rewardTokens.push(token);
            _isRewardToken[token] = true;
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

    function rewardTokens() external view override returns (address[] memory) {
        return _rewardTokens;
    }

    function isRewardToken(address token) external view override returns (bool) {
        return _isRewardToken[token];
    }
}