// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import '../ProtocolFeeCollector.sol';
import '../interfaces/ISummitXV3Pool.sol';
import '../interfaces/IERC20Minimal.sol';

contract MockToken is IERC20Minimal {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        totalSupply = 1000000 * 10**18;
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 value) external override returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        return true;
    }
    
    function approve(address spender, uint256 value) external override returns (bool) {
        allowance[msg.sender][spender] = value;
        return true;
    }
}

contract MockPool is ISummitXV3Pool {
    address public immutable override factory;
    address public immutable override token0;
    address public immutable override token1;
    uint24 public immutable override fee;
    int24 public immutable override tickSpacing;
    uint128 public immutable override maxLiquidityPerTick;
    
    struct ProtocolFees {
        uint128 token0;
        uint128 token1;
    }
    
    ProtocolFees public override protocolFees;
    
    constructor(address _factory, address _token0, address _token1, uint24 _fee) {
        factory = _factory;
        token0 = _token0;
        token1 = _token1;
        fee = _fee;
        tickSpacing = 60;
        maxLiquidityPerTick = 1000000;
    }
    
    function setProtocolFees(uint128 _token0, uint128 _token1) external {
        protocolFees.token0 = _token0;
        protocolFees.token1 = _token1;
    }
    
    function collectProtocol(
        address recipient,
        uint128 amount0Requested,
        uint128 amount1Requested
    ) external override returns (uint128 amount0, uint128 amount1) {
        amount0 = amount0Requested > protocolFees.token0 ? protocolFees.token0 : amount0Requested;
        amount1 = amount1Requested > protocolFees.token1 ? protocolFees.token1 : amount1Requested;
        
        if (amount0 > 0) {
            protocolFees.token0 -= amount0;
            IERC20Minimal(token0).transfer(recipient, amount0);
        }
        if (amount1 > 0) {
            protocolFees.token1 -= amount1;
            IERC20Minimal(token1).transfer(recipient, amount1);
        }
    }
    
    // Stub implementations for other required functions
    function slot0() external view override returns (
        uint160 sqrtPriceX96,
        int24 tick,
        uint16 observationIndex,
        uint16 observationCardinality,
        uint16 observationCardinalityNext,
        uint32 feeProtocol,
        bool unlocked
    ) {
        return (0, 0, 0, 0, 0, 0, true);
    }
    
    function feeGrowthGlobal0X128() external view override returns (uint256) { return 0; }
    function feeGrowthGlobal1X128() external view override returns (uint256) { return 0; }
    function liquidity() external view override returns (uint128) { return 0; }
    function ticks(int24) external view override returns (uint128, int128, uint256, uint256, int56, uint160, uint32, bool) {
        return (0, 0, 0, 0, 0, 0, 0, false);
    }
    function tickBitmap(int16) external view override returns (uint256) { return 0; }
    function positions(bytes32) external view override returns (uint128, uint256, uint256, uint128, uint128) {
        return (0, 0, 0, 0, 0);
    }
    function observations(uint256) external view override returns (uint32, int56, uint160, bool) {
        return (0, 0, 0, false);
    }
    
    function initialize(uint160) external override {}
    function mint(address, int24, int24, uint128, bytes calldata) external override returns (uint256, uint256) { return (0, 0); }
    function collect(address, int24, int24, uint128, uint128) external override returns (uint128, uint128) { return (0, 0); }
    function burn(int24, int24, uint128) external override returns (uint256, uint256) { return (0, 0); }
    function swap(address, bool, int256, uint160, bytes calldata) external override returns (int256, int256) { return (0, 0); }
    function flash(address, uint256, uint256, bytes calldata) external override {}
    function increaseObservationCardinalityNext(uint16) external override {}
    function setFeeProtocol(uint32, uint32) external override {}
    function setLmPool(address) external override {}
    function snapshotCumulativesInside(int24, int24) external view override returns (int56, uint160, uint32) { return (0, 0, 0); }
    function observe(uint32[] calldata) external view override returns (int56[] memory, uint160[] memory) {
        int56[] memory a = new int56[](1);
        uint160[] memory b = new uint160[](1);
        return (a, b);
    }
}

contract MockVoter {
    mapping(address => address) public gaugeForPool;
    mapping(address => bool) public isAlive;
    mapping(address => address) public feeDistributorForGauge;
    mapping(address => address) public poolRedirect;
    
    function setGaugeForPool(address pool, address gauge) external {
        gaugeForPool[pool] = gauge;
    }
    
    function setIsAlive(address gauge, bool alive) external {
        isAlive[gauge] = alive;
    }
    
    function setFeeDistributorForGauge(address gauge, address distributor) external {
        feeDistributorForGauge[gauge] = distributor;
    }
    
    function setPoolRedirect(address pool, address redirect) external {
        poolRedirect[pool] = redirect;
    }
}

contract MockFeeDistributor {
    function notifyRewardAmount(address token, uint256 amount) external {}
}

contract ProtocolFeeCollectorTest {
    ProtocolFeeCollector public collector;
    MockToken public token0;
    MockToken public token1;
    MockPool public pool;
    MockVoter public voter;
    MockFeeDistributor public feeDistributor;
    
    address public treasury = address(0x1);
    
    function setUp() external {
        token0 = new MockToken("Token0", "TKN0");
        token1 = new MockToken("Token1", "TKN1");
        voter = new MockVoter();
        feeDistributor = new MockFeeDistributor();
        collector = new ProtocolFeeCollector(treasury, address(voter));
        pool = new MockPool(address(this), address(token0), address(token1), 500);
        
        // Transfer some tokens to pool
        token0.transfer(address(pool), 1000 * 10**18);
        token1.transfer(address(pool), 1000 * 10**18);
        
        // Set up voter mappings
        voter.setGaugeForPool(address(pool), address(0x2));
        voter.setIsAlive(address(0x2), true);
        voter.setFeeDistributorForGauge(address(0x2), address(feeDistributor));
    }
    
    function testBasicFunctionality() external {
        // Set some protocol fees
        pool.setProtocolFees(100 * 10**18, 50 * 10**18);
        
        // Collect protocol fees
        collector.collectProtocolFees(pool);
        
        // Check that fees were collected
        (uint128 fees0, uint128 fees1) = pool.protocolFees();
        require(fees0 == 0, "Token0 fees should be collected");
        require(fees1 == 0, "Token1 fees should be collected");
    }
}