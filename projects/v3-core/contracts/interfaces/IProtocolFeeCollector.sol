// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import './ISummitXV3Pool.sol';

interface IProtocolFeeCollector {
    event FeesCollected(
        address indexed pool,
        uint256 amount0Distributed,
        uint256 amount1Distributed,
        uint256 amount0Treasury,
        uint256 amount1Treasury
    );

    event TreasuryChanged(address indexed oldTreasury, address indexed newTreasury);

    event TreasuryFeesChanged(uint256 oldTreasuryFees, uint256 newTreasuryFees);

    // Custom errors not available in Solidity 0.7.6
    // error NOT_AUTHORIZED();
    // error FTL(); // Fee too large

    /// @notice Returns the current treasury address
    function treasury() external view returns (address);

    /// @notice Returns the current treasury fee percentage (basis points)
    function treasuryFees() external view returns (uint256);

    /// @notice Sets the treasury address
    /// @param _treasury The new treasury address
    function setTreasury(address _treasury) external;

    /// @notice Sets the treasury fee percentage
    /// @param _treasuryFees The new treasury fee percentage (basis points, max 10000)
    function setTreasuryFees(uint256 _treasuryFees) external;

    /// @notice Collects protocol fees from a pool and distributes them
    /// @param pool The pool to collect fees from
    function collectProtocolFees(ISummitXV3Pool pool) external;
}