// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.5;

import '@muchfi/v3-core/contracts/interfaces/IMuchFiV3Factory.sol';
import '@muchfi/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol';

import './LBPMuchFiV3LmPool.sol';

/// @dev This contract is for Master Chef to create a corresponding LmPool when
/// adding a new farming pool. As for why not just create LmPool inside the
/// Master Chef contract is merely due to the imcompatibility of the solidity
/// versions.
contract LBPMuchFiV3LmPoolDeployer {
    address public immutable masterChef;

    modifier onlyMasterChef() {
        require(msg.sender == masterChef, "Not MC");
        _;
    }

    constructor(address _masterChef) {
        masterChef = _masterChef;
    }

    /// @dev Deploys a LmPool
    /// @param pool The contract address of the MuchFi V3 pool
    function deploy(IMuchFiV3Pool pool) external onlyMasterChef returns (IMuchFiV3LmPool lmPool) {
        lmPool = new LBPMuchFiV3LmPool(address(pool), masterChef, uint32(block.timestamp));
        IMuchFiV3Factory(INonfungiblePositionManager(IMasterChefV3(masterChef).nonfungiblePositionManager()).factory()).setLmPool(address(pool), address(lmPool));
    }
}