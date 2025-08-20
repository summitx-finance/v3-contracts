// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

interface IPoolCreationHandler {
    /**
     * @notice Called before a new V2 pool is created to validate if creation should proceed
     * @param token0 The first token of the pool
     * @param token1 The second token of the pool  
     * @param creator The address attempting to create the pool
     * @return canCreate Whether the pool creation should be allowed
     * @return reason If canCreate is false, the reason for rejection
     */
    function beforeV2PoolCreation(
        address token0,
        address token1,
        address creator
    ) external view returns (bool canCreate, string memory reason);
}