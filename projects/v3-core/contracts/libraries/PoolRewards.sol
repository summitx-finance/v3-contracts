// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0 <0.8.0;

import './LowGasSafeMath.sol';

/// @title Pool Rewards
/// @notice Library for managing period-based reward tracking in pools
library PoolRewards {
    using LowGasSafeMath for uint256;

    // Reward info for each position in a period
    struct RewardInfo {
        // Used to account for changes in the deposit amount
        int256 secondsDebtX96;
        // Used to check if starting seconds have already been written
        bool initialized;
        // Used to account for changes in secondsPerLiquidity
        int160 secondsPerLiquidityPeriodStartX128;
    }

    // Period information
    struct PeriodInfo {
        uint32 previousPeriod;
        int24 startTick;
        int24 lastTick;
        uint160 endSecondsPerLiquidityPeriodX128;
    }

    // Position checkpoint for period tracking
    struct PositionCheckpoint {
        uint256 period;
        uint256 liquidity;
    }

    /// @notice Get the current period (weekly periods)
    function getCurrentPeriod() internal view returns (uint256) {
        return block.timestamp / 1 weeks;
    }

    /// @notice Initialize reward info for a position in a period
    /// @param self The reward info to initialize
    /// @param secondsPerLiquidityPeriodStartX128 The starting seconds per liquidity for the period
    function initialize(
        RewardInfo storage self,
        int160 secondsPerLiquidityPeriodStartX128
    ) internal {
        self.secondsPerLiquidityPeriodStartX128 = secondsPerLiquidityPeriodStartX128;
        self.initialized = true;
    }

    /// @notice Update reward info for a position
    /// @param self The reward info to update
    /// @param liquidityDelta The change in liquidity
    /// @param secondsPerLiquidityInsideX128 The seconds per liquidity inside the position
    function update(
        RewardInfo storage self,
        int128 liquidityDelta,
        uint160 secondsPerLiquidityInsideX128
    ) internal {
        if (!self.initialized) {
            self.secondsPerLiquidityPeriodStartX128 = int160(secondsPerLiquidityInsideX128);
            self.initialized = true;
        }

        if (liquidityDelta != 0) {
            self.secondsDebtX96 = self.secondsDebtX96 + (
                int256(liquidityDelta) * (
                    int256(secondsPerLiquidityInsideX128) - 
                    int256(self.secondsPerLiquidityPeriodStartX128)
                ) / int256(2**32)
            );
        }
    }

    /// @notice Calculate seconds inside for a position in a period
    /// @param self The reward info
    /// @param liquidity The position liquidity
    /// @param secondsPerLiquidityInsideX128 The seconds per liquidity inside the position
    /// @return secondsInside The seconds inside for the position
    function getSecondsInside(
        RewardInfo storage self,
        uint128 liquidity,
        uint160 secondsPerLiquidityInsideX128
    ) internal view returns (uint256 secondsInside) {
        if (!self.initialized) return 0;

        int256 secondsInsideX96 = int256(liquidity) * (
            int256(secondsPerLiquidityInsideX128) - 
            int256(self.secondsPerLiquidityPeriodStartX128)
        ) / int256(2**32) - self.secondsDebtX96;

        return secondsInsideX96 > 0 ? uint256(secondsInsideX96) / 2**96 : 0;
    }
}