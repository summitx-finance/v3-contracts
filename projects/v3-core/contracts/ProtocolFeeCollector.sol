// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import './interfaces/IProtocolFeeCollector.sol';
import './interfaces/IVoter.sol';
import './interfaces/IFeeDistributor.sol';
import './interfaces/ISummitXV3Pool.sol';
import './interfaces/IERC20Minimal.sol';
import './libraries/TransferHelper.sol';
import './libraries/LowGasSafeMath.sol';

contract ProtocolFeeCollector is IProtocolFeeCollector {
    using LowGasSafeMath for uint256;

    uint256 public constant BASIS = 10000;
    uint256 public override treasuryFees;

    address public override treasury;
    IVoter public voter;

    modifier onlyTreasury() {
        require(msg.sender == treasury, 'NOT_AUTHORIZED');
        _;
    }

    constructor(address _treasury, address _voter) {
        treasury = _treasury;
        voter = IVoter(_voter);
        treasuryFees = 1000; // 10% default treasury fee
    }

    function setTreasury(address _treasury) external override onlyTreasury {
        emit TreasuryChanged(treasury, _treasury);
        treasury = _treasury;
    }

    function setTreasuryFees(uint256 _treasuryFees) external override onlyTreasury {
        require(_treasuryFees <= BASIS, 'FTL');
        emit TreasuryFeesChanged(treasuryFees, _treasuryFees);
        treasuryFees = _treasuryFees;
    }

    function collectProtocolFees(ISummitXV3Pool pool) external override {
        // Get tokens
        IERC20Minimal token0 = IERC20Minimal(pool.token0());
        IERC20Minimal token1 = IERC20Minimal(pool.token1());

        // Fetch pending fees
        (uint128 pushable0, uint128 pushable1) = pool.protocolFees();
        
        // Return early if zero pending fees
        if (pushable0 == 0 && pushable1 == 0) return;

        // Check if there's a gauge
        IVoter _voter = voter;
        address gauge = _voter.gaugeForPool(address(pool));
        bool isAlive = _voter.isAlive(gauge);

        // Check if it's a pool redirected to another gauge
        if (gauge == address(0) || !isAlive) {
            address toPool = _voter.poolRedirect(address(pool));
            gauge = _voter.gaugeForPool(toPool);
            isAlive = _voter.isAlive(gauge);
        }

        // If there's no gauge, send everything to treasury
        if (gauge == address(0) || !isAlive) {
            pool.collectProtocol(treasury, type(uint128).max, type(uint128).max);
            emit FeesCollected(address(pool), 0, 0, pushable0, pushable1);
            return;
        }

        // Get the fee distributor
        IFeeDistributor feeDist = IFeeDistributor(_voter.feeDistributorForGauge(gauge));

        // Collect protocol fees to this contract
        pool.collectProtocol(address(this), type(uint128).max, type(uint128).max);

        // Get actual balances (in case of transfer fees)
        uint256 amount0 = token0.balanceOf(address(this));
        uint256 amount1 = token1.balanceOf(address(this));

        uint256 amount0Treasury;
        uint256 amount1Treasury;

        // Calculate treasury fees
        uint256 _treasuryFees = treasuryFees;
        if (_treasuryFees > 0) {
            amount0Treasury = amount0.mul(_treasuryFees) / BASIS;
            amount1Treasury = amount1.mul(_treasuryFees) / BASIS;

            amount0 = amount0.sub(amount0Treasury);
            amount1 = amount1.sub(amount1Treasury);

            // Transfer treasury fees
            address _treasury = treasury;
            if (amount0Treasury > 0) {
                TransferHelper.safeTransfer(address(token0), _treasury, amount0Treasury);
            }
            if (amount1Treasury > 0) {
                TransferHelper.safeTransfer(address(token1), _treasury, amount1Treasury);
            }
        }

        // Distribute remaining fees to gauge
        if (amount0 > 0) {
            TransferHelper.safeTransfer(address(token0), address(feeDist), amount0);
            feeDist.notifyRewardAmount(address(token0), amount0);
        }
        if (amount1 > 0) {
            TransferHelper.safeTransfer(address(token1), address(feeDist), amount1);
            feeDist.notifyRewardAmount(address(token1), amount1);
        }

        emit FeesCollected(address(pool), amount0, amount1, amount0Treasury, amount1Treasury);
    }
}