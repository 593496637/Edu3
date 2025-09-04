import CoursePlatformABI from "./contracts/CoursePlatform.json";
import YDTokenABI from "./contracts/YDToken.json";

// Contract Addresses (Sepolia Testnet)
// Version: v1.0 (Basic functionality - currently deployed)
export const COURSE_PLATFORM_ADDRESS = "0x537feaEaAe0B3B2dF87AfB3cA349C1fd118DbCf8";
export const YD_TOKEN_ADDRESS = "0x66d81ddC9259DEc4cD2FCEfd101C3AA29110FbF9";

// Future deployment addresses (v2.0 - Enhanced functionality)
// Update these when new contracts are deployed
// export const NEW_COURSE_PLATFORM_ADDRESS = "0x...";
// export const NEW_YD_TOKEN_ADDRESS = "0x...";
// export const AAVE_ADAPTER_ADDRESS = "0x...";

// AAVE V3 Addresses (Sepolia Testnet) - for future DeFi integration
export const AAVE_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
export const WETH_GATEWAY_ADDRESS = "0x387d311e47e80b498169e6fb51d3193167d89F7D";
export const WETH_ADDRESS = "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c";

// Contract configurations
export const coursePlatformConfig = {
  address: COURSE_PLATFORM_ADDRESS as `0x${string}`,
  abi: CoursePlatformABI.abi,
};

export const ydTokenConfig = {
  address: YD_TOKEN_ADDRESS as `0x${string}`,
  abi: YDTokenABI.abi,
};

// Future contract configurations (uncomment when deployed)
// export const aaveAdapterConfig = {
//   address: AAVE_ADAPTER_ADDRESS as `0x${string}`,
//   abi: AaveAdapterABI.abi,
// };
