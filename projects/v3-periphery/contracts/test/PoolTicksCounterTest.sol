// SPDX-License-Identifier: GPL-2.0-or-later
import '@summitx/v3-core/contracts/interfaces/ISummitXV3Pool.sol';

pragma solidity >=0.6.0;

import '../libraries/PoolTicksCounter.sol';

contract PoolTicksCounterTest {
    using PoolTicksCounter for ISummitXV3Pool;

    function countInitializedTicksCrossed(
        ISummitXV3Pool pool,
        int24 tickBefore,
        int24 tickAfter
    ) external view returns (uint32 initializedTicksCrossed) {
        return pool.countInitializedTicksCrossed(tickBefore, tickAfter);
    }
}
