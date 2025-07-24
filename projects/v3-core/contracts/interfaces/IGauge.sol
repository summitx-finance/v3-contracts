// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

interface IGauge {
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, address indexed token, uint256 amount);
    event RewardAdded(address indexed token, uint256 reward);

    // Custom errors not available in Solidity 0.7.6
    // error NOT_AUTHORIZED();
    // error INVALID_AMOUNT();
    // error GAUGE_KILLED();

    /// @notice Returns the pool address this gauge is for
    function pool() external view returns (address);

    /// @notice Returns the voter contract address
    function voter() external view returns (address);

    /// @notice Returns whether the gauge is alive (active)
    function isAlive() external view returns (bool);

    /// @notice Returns the total staked amount
    function totalSupply() external view returns (uint256);

    /// @notice Returns the staked amount for a user
    function balanceOf(address user) external view returns (uint256);

    /// @notice Returns the earned rewards for a user and token
    function earned(address user, address token) external view returns (uint256);

    /// @notice Returns the reward rate for a token
    function rewardRate(address token) external view returns (uint256);

    /// @notice Returns the reward per token for a token
    function rewardPerToken(address token) external view returns (uint256);

    /// @notice Stake tokens in the gauge
    /// @param amount The amount to stake
    function deposit(uint256 amount) external;

    /// @notice Withdraw staked tokens from the gauge
    /// @param amount The amount to withdraw
    function withdraw(uint256 amount) external;

    /// @notice Claim rewards for a specific token
    /// @param token The reward token address
    function claimReward(address token) external;

    /// @notice Claim all available rewards
    function claimAllRewards() external;

    /// @notice Add reward tokens to the gauge (only voter can call)
    /// @param token The reward token address
    /// @param amount The amount of rewards to add
    function notifyRewardAmount(address token, uint256 amount) external;

    /// @notice Kill the gauge (only voter can call)
    function kill() external;

    /// @notice Revive the gauge (only voter can call)
    function revive() external;
}