// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YDToken
 * @dev The native utility token for the Web3 University platform.
 * It is an ERC20 token that includes a mechanism for users to
 * exchange ETH for YD tokens at a fixed rate.
 */
contract YDToken is ERC20, Ownable {
    // 定义 ETH 和 YD 之间的固定兑换率
    // 1 ETH = 1000 YD
    uint256 public constant EXCHANGE_RATE = 1000;

    // 定义事件，当用户成功兑换 YD 时触发
    event ExchangedEthForYd(
        address indexed user,
        uint256 ethAmount,
        uint256 ydAmount
    );

    /**
     * @dev Sets the initial owner and mints the initial supply of tokens
     * to the contract deployer's address (owner).
     * @param initialOwner The address that will initially own the contract.
     */
    constructor(
        address initialOwner
    ) ERC20("Yideng Token", "YD") Ownable(initialOwner) {
        // 根据白皮书，为团队、投资人、空投等预先铸造代币
        // 总供应量 = 1,000,000 YD
        // 注意：ERC20的单位是带小数的，1,000,000 YD 需要写成 1000000 * 10**18
        _mint(owner(), 1000000 * (10 ** uint256(decimals())));
    }

    /**
     * @dev Allows any user to send ETH to the contract and receive YD tokens in return.
     * The function is payable, meaning it can receive Ether.
     */
    function exchangeEthForYd() external payable {
        require(msg.value > 0, "YDToken: You must send some ETH to exchange.");

        // 根据收到的 ETH 数量和兑换率计算应该发行的 YD 数量
        uint256 ydAmount = msg.value * EXCHANGE_RATE;

        // 为用户铸造新计算出的 YD 代币
        _mint(msg.sender, ydAmount);

        // 触发兑换成功事件
        emit ExchangedEthForYd(msg.sender, msg.value, ydAmount);
    }

    /**
     * @dev Allows the owner to withdraw the ETH collected in this contract.
     * This is crucial for the team to retrieve the funds.
     */
    function withdrawEth() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "YDToken: No ETH to withdraw.");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "YDToken: Failed to withdraw ETH.");
    }
}
