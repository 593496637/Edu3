// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IWETHGateway
 * @author Aave
 * @notice Defines the basic interface for the WETHGateway
 */
interface IWETHGateway {
    /**
     * @notice Deposits WETH into the reserve, using native ETH. A corresponding amount of the overlying asset (aTokens)
     * is minted.
     * @param pool The address of the lending pool where the asset will be deposited
     * @param onBehalfOf The address that will receive the aWETH, same as msg.sender if the user
     * wants to receive them on his own wallet, or a different address if the beneficiary of aWETH
     * is a different wallet
     * @param referralCode Code used to register the integrator originating the operation, for potential rewards.
     * 0 if the action is executed directly by the user, without any middle-man
     */
    function depositETH(
        address pool,
        address onBehalfOf,
        uint16 referralCode
    ) external payable;

    /**
     * @notice Withdraws the WETH _reserves of msg.sender.
     * @param pool The address of the lending pool where the asset will be withdrawn from
     * @param amount The amount of WETH to withdraw. If uint256(-1), user withdraws all aWETH
     * @param to The address that will receive the ETH, same as msg.sender if the user
     * wants to receive it on his own wallet, or a different address if the beneficiary is a
     * different wallet
     */
    function withdrawETH(
        address pool,
        uint256 amount,
        address to
    ) external;

    /**
     * @notice Get WETH address used by WETHGateway
     */
    function getWETHAddress() external view returns (address);
}