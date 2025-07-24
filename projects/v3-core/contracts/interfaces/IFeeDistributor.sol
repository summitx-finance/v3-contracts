// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

interface IFeeDistributor {
    event RewardAdded(address indexed token, uint256 reward);
    event RewardPaid(address indexed user, address indexed token, uint256 reward);

    // Custom errors not available in Solidity 0.7.6
    // error NOT_AUTHORIZED();
    // error INVALID_AMOUNT();

    /// @notice Returns the gauge address this fee distributor is for
    function gauge() external view returns (address);

    /// @notice Returns the earned rewards for a user and token
    function earned(address user, address token) external view returns (uint256);

    /// @notice Returns the reward rate for a token
    function rewardRate(address token) external view returns (uint256);

    /// @notice Returns the reward per token for a token
    function rewardPerToken(address token) external view returns (uint256);

    /// @notice Claim rewards for a specific token
    /// @param user The user address
    /// @param token The reward token address
    function claimReward(address user, address token) external;

    /// @notice Add reward tokens to the distributor
    /// @param token The reward token address
    /// @param amount The amount of rewards to add
    function notifyRewardAmount(address token, uint256 amount) external;

    /// @notice Returns the total reward tokens available
    function rewardTokens() external view returns (address[] memory);

    /// @notice Returns whether a token is a reward token
    function isRewardToken(address token) external view returns (bool);
}