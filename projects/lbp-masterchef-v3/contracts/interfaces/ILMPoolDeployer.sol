// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./ISummitXV3Pool.sol";
import "./ILMPool.sol";

interface ILMPoolDeployer {
    function deploy(ISummitXV3Pool pool) external returns (ILMPool lmPool);
}
