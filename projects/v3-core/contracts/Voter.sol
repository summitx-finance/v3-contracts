// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import './interfaces/IVoter.sol';
import './interfaces/IGauge.sol';
import './interfaces/IFeeDistributor.sol';
import './interfaces/ISummitXV3Pool.sol';
import './libraries/LowGasSafeMath.sol';

contract Voter is IVoter {
    using LowGasSafeMath for uint256;

    address public immutable factory;
    address public immutable gaugeFactory;
    address public immutable feeDistributorFactory;
    address public owner;

    mapping(address => address) public override gaugeForPool;
    mapping(address => address) public override feeDistributorForGauge;
    mapping(address => address) public override poolRedirect;
    mapping(address => bool) public override isAlive;
    mapping(address => uint256) public override weights;
    mapping(uint256 => mapping(address => uint256)) public votes; // tokenId => pool => weight
    mapping(uint256 => address[]) public poolVote; // tokenId => pools
    mapping(uint256 => uint256) public usedWeights; // tokenId => total weight used

    uint256 public override totalWeight;
    uint256 public lastDistribution;

    address[] public allGauges;
    mapping(address => bool) public isGauge;

    modifier onlyOwner() {
        require(msg.sender == owner, 'NOT_AUTHORIZED');
        _;
    }

    constructor(address _factory, address _gaugeFactory, address _feeDistributorFactory) {
        factory = _factory;
        gaugeFactory = _gaugeFactory;
        feeDistributorFactory = _feeDistributorFactory;
        owner = msg.sender;
        lastDistribution = block.timestamp;
    }

    function setOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    function createGauge(address pool) external override returns (address gauge) {
        require(gaugeForPool[pool] == address(0), 'ALREADY_EXISTS');
        
        // For now, we'll use external factory contracts for deployment
        // This is a placeholder - in production, you'd use proper CREATE2 deployment
        require(false, 'GAUGE_CREATION_NOT_IMPLEMENTED');

        // Set mappings (commented out for now)
        // gaugeForPool[pool] = gauge;
        // feeDistributorForGauge[gauge] = feeDistributor;
        // isAlive[gauge] = true;
        // isGauge[gauge] = true;
        // allGauges.push(gauge);

        // emit GaugeCreated(gauge, msg.sender, pool);
    }

    function killGauge(address gauge) external override onlyOwner {
        require(isGauge[gauge], 'INVALID_GAUGE');
        isAlive[gauge] = false;
        IGauge(gauge).kill();
        emit GaugeKilled(gauge);
    }

    function reviveGauge(address gauge) external override onlyOwner {
        require(isGauge[gauge], 'INVALID_GAUGE');
        isAlive[gauge] = true;
        IGauge(gauge).revive();
        emit GaugeRevived(gauge);
    }

    function vote(uint256 tokenId, address[] calldata pools, uint256[] calldata _weights) external override {
        require(pools.length == _weights.length, 'INVALID_ARRAYS');
        
        // Reset previous votes
        _reset(tokenId);

        uint256 _totalWeight = 0;
        for (uint256 i = 0; i < pools.length; i++) {
            address pool = pools[i];
            uint256 weight = _weights[i];
            
            require(gaugeForPool[pool] != address(0), 'INVALID_POOL');
            require(isAlive[gaugeForPool[pool]], 'GAUGE_NOT_ALIVE');
            
            votes[tokenId][pool] = weight;
            poolVote[tokenId].push(pool);
            weights[pool] = weights[pool].add(weight);
            totalWeight = totalWeight.add(weight);
            _totalWeight = _totalWeight.add(weight);
            
            emit Voted(msg.sender, tokenId, int256(weight));
        }
        
        usedWeights[tokenId] = _totalWeight;
    }

    function abstain(uint256 tokenId) external override {
        _reset(tokenId);
        emit Abstained(tokenId, int256(usedWeights[tokenId]));
    }

    function _reset(uint256 tokenId) internal {
        address[] memory _poolVote = poolVote[tokenId];
        uint256 _usedWeight = usedWeights[tokenId];
        
        for (uint256 i = 0; i < _poolVote.length; i++) {
            address pool = _poolVote[i];
            uint256 weight = votes[tokenId][pool];
            
            weights[pool] = weights[pool].sub(weight);
            votes[tokenId][pool] = 0;
        }
        
        delete poolVote[tokenId];
        usedWeights[tokenId] = 0;
        totalWeight = totalWeight.sub(_usedWeight);
    }

    function distributeRewards() external override {
        require(block.timestamp >= lastDistribution + 1 weeks, 'TOO_EARLY');
        
        // This would typically distribute emission tokens to gauges
        // For now, just update the timestamp
        lastDistribution = block.timestamp;
        
        // In a full implementation, this would:
        // 1. Calculate rewards for each gauge based on weights
        // 2. Distribute emission tokens to gauges
        // 3. Update gauge reward rates
    }

    function getAllGauges() external view returns (address[] memory) {
        return allGauges;
    }

    function getPoolVote(uint256 tokenId) external view returns (address[] memory) {
        return poolVote[tokenId];
    }
}