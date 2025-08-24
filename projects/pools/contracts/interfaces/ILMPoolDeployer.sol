// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IMuchFiV3Pool.sol";
import "./ILMPool.sol";

interface ILMPoolDeployer {
    function deploy(IMuchFiV3Pool pool) external returns (ILMPool lmPool);
}
