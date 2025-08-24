// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6;

import './pool/IMuchFiV3PoolImmutables.sol';
import './pool/IMuchFiV3PoolState.sol';
import './pool/IMuchFiV3PoolDerivedState.sol';
import './pool/IMuchFiV3PoolActions.sol';
import './pool/IMuchFiV3PoolOwnerActions.sol';
import './pool/IMuchFiV3PoolEvents.sol';

/// @title The interface for a MuchFi V3 Pool
/// @notice A MuchFi pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface IMuchFiV3Pool is
    IMuchFiV3PoolImmutables,
    IMuchFiV3PoolState,
    IMuchFiV3PoolDerivedState,
    IMuchFiV3PoolActions,
    IMuchFiV3PoolOwnerActions,
    IMuchFiV3PoolEvents
{

}