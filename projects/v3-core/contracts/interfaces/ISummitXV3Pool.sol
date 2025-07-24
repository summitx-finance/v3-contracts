// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6;

import './pool/ISummitXV3PoolImmutables.sol';
import './pool/ISummitXV3PoolState.sol';
import './pool/ISummitXV3PoolDerivedState.sol';
import './pool/ISummitXV3PoolActions.sol';
import './pool/ISummitXV3PoolOwnerActions.sol';
import './pool/ISummitXV3PoolEvents.sol';

/// @title The interface for a SummitX V3 Pool
/// @notice A SummitX pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface ISummitXV3Pool is
    ISummitXV3PoolImmutables,
    ISummitXV3PoolState,
    ISummitXV3PoolDerivedState,
    ISummitXV3PoolActions,
    ISummitXV3PoolOwnerActions,
    ISummitXV3PoolEvents
{

}