// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IPool.sol";
import "./interfaces/IWETHGateway.sol";

/**
 * @title AaveAdapter
 * @dev Adapter contract for interacting with AAVE V3 Protocol
 * Allows users to deposit ETH and ERC20 tokens to earn yield
 */
contract AaveAdapter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // AAVE protocol contracts
    IPool public immutable aavePool;
    IWETHGateway public immutable wethGateway;
    
    // Supported assets
    address public immutable wethAddress;
    mapping(address => bool) public supportedAssets;
    
    // Events
    event DepositedETH(address indexed user, uint256 amount);
    event WithdrewETH(address indexed user, uint256 amount);
    event DepositedERC20(address indexed user, address indexed asset, uint256 amount);
    event WithdrewERC20(address indexed user, address indexed asset, uint256 amount);
    event AssetAdded(address indexed asset);
    event AssetRemoved(address indexed asset);

    constructor(
        address initialOwner,
        address _aavePool,
        address _wethGateway,
        address _wethAddress
    ) Ownable(initialOwner) {
        require(_aavePool != address(0), "AaveAdapter: Invalid pool address");
        require(_wethGateway != address(0), "AaveAdapter: Invalid gateway address");
        require(_wethAddress != address(0), "AaveAdapter: Invalid WETH address");
        
        aavePool = IPool(_aavePool);
        wethGateway = IWETHGateway(_wethGateway);
        wethAddress = _wethAddress;
        
        // WETH is supported by default
        supportedAssets[_wethAddress] = true;
    }

    /**
     * @dev Add supported asset (owner only)
     * @param asset The asset address to add
     */
    function addSupportedAsset(address asset) external onlyOwner {
        require(asset != address(0), "AaveAdapter: Invalid asset address");
        require(!supportedAssets[asset], "AaveAdapter: Asset already supported");
        
        supportedAssets[asset] = true;
        emit AssetAdded(asset);
    }

    /**
     * @dev Remove supported asset (owner only)
     * @param asset The asset address to remove
     */
    function removeSupportedAsset(address asset) external onlyOwner {
        require(asset != wethAddress, "AaveAdapter: Cannot remove WETH");
        require(supportedAssets[asset], "AaveAdapter: Asset not supported");
        
        supportedAssets[asset] = false;
        emit AssetRemoved(asset);
    }

    /**
     * @dev Deposit ETH to AAVE
     */
    function depositETH() external payable nonReentrant {
        require(msg.value > 0, "AaveAdapter: Must send ETH");
        
        // Deposit ETH through WETHGateway
        wethGateway.depositETH{value: msg.value}(
            address(aavePool),
            msg.sender, // aWETH goes directly to user
            0 // referralCode
        );
        
        emit DepositedETH(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw ETH from AAVE
     * @param amount The amount of ETH to withdraw (use type(uint256).max for all)
     */
    function withdrawETH(uint256 amount) external nonReentrant {
        require(amount > 0, "AaveAdapter: Amount must be greater than 0");
        
        // Withdraw ETH through WETHGateway
        wethGateway.withdrawETH(
            address(aavePool),
            amount,
            msg.sender // ETH goes directly to user
        );
        
        emit WithdrewETH(msg.sender, amount);
    }

    /**
     * @dev Deposit ERC20 token to AAVE
     * @param asset The asset address to deposit
     * @param amount The amount to deposit
     */
    function depositERC20(address asset, uint256 amount) external nonReentrant {
        require(supportedAssets[asset], "AaveAdapter: Asset not supported");
        require(amount > 0, "AaveAdapter: Amount must be greater than 0");
        
        IERC20 token = IERC20(asset);
        require(token.balanceOf(msg.sender) >= amount, "AaveAdapter: Insufficient balance");
        
        // Transfer tokens from user to this contract
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        // Approve AAVE pool to spend tokens
        token.forceApprove(address(aavePool), amount);
        
        // Supply to AAVE pool
        aavePool.supply(
            asset,
            amount,
            msg.sender, // aTokens go directly to user
            0 // referralCode
        );
        
        emit DepositedERC20(msg.sender, asset, amount);
    }

    /**
     * @dev Withdraw ERC20 token from AAVE
     * @param asset The asset address to withdraw
     * @param amount The amount to withdraw (use type(uint256).max for all)
     */
    function withdrawERC20(address asset, uint256 amount) external nonReentrant {
        require(supportedAssets[asset], "AaveAdapter: Asset not supported");
        require(amount > 0, "AaveAdapter: Amount must be greater than 0");
        
        // Withdraw from AAVE pool
        aavePool.withdraw(
            asset,
            amount,
            msg.sender // tokens go directly to user
        );
        
        emit WithdrewERC20(msg.sender, asset, amount);
    }

    /**
     * @dev Get user account data from AAVE
     * @param user The user address
     */
    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        return aavePool.getUserAccountData(user);
    }

    /**
     * @dev Emergency function to recover tokens sent by mistake
     * @param token The token to recover
     * @param amount The amount to recover
     */
    function recoverToken(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "AaveAdapter: Invalid token address");
        require(amount > 0, "AaveAdapter: Amount must be greater than 0");
        
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @dev Emergency function to recover ETH sent by mistake
     */
    function recoverETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "AaveAdapter: No ETH to recover");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "AaveAdapter: ETH recovery failed");
    }
}