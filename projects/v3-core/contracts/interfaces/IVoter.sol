// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

interface IVoter {
    event GaugeCreated(address indexed gauge, address indexed creator, address indexed pool);
    event GaugeKilled(address indexed gauge);
    event GaugeRevived(address indexed gauge);
    event Voted(address indexed voter, uint256 tokenId, int256 weight);
    event Abstained(uint256 tokenId, int256 weight);
    event WeightsDistributed(address indexed gauge, uint256 amount);

    // Custom errors not available in Solidity 0.7.6
    // error ALREADY_EXISTS();
    // error NOT_AUTHORIZED();
    // error INVALID_GAUGE();
    // error GAUGE_NOT_ALIVE();

    /// @notice Returns the gauge address for a given pool
    function gaugeForPool(address pool) external view returns (address);

    /// @notice Returns whether a gauge is alive (active)
    function isAlive(address gauge) external view returns (bool);

    /// @notice Returns the fee distributor address for a given gauge
    function feeDistributorForGauge(address gauge) external view returns (address);

    /// @notice Returns the pool redirect address for a given pool
    function poolRedirect(address pool) external view returns (address);

    /// @notice Creates a new gauge for a pool
    /// @param pool The pool address
    /// @return gauge The created gauge address
    function createGauge(address pool) external returns (address gauge);

    /// @notice Kills a gauge (makes it inactive)
    /// @param gauge The gauge address to kill
    function killGauge(address gauge) external;

    /// @notice Revives a killed gauge
    /// @param gauge The gauge address to revive
    function reviveGauge(address gauge) external;

    /// @notice Vote for gauge weights
    /// @param tokenId The voting token ID
    /// @param pools Array of pool addresses to vote for
    /// @param _weights Array of weights for each pool
    function vote(uint256 tokenId, address[] calldata pools, uint256[] calldata _weights) external;

    /// @notice Abstain from voting
    /// @param tokenId The voting token ID
    function abstain(uint256 tokenId) external;

    /// @notice Distribute rewards to gauges based on votes
    function distributeRewards() external;

    /// @notice Returns the total weight for a pool
    function weights(address pool) external view returns (uint256);

    /// @notice Returns the total votes for all pools
    function totalWeight() external view returns (uint256);
}