import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * 课程平台部署模块
 * 
 * 此模块按正确顺序部署所有合约：
 * 1. 首先部署 YDToken 合约
 * 2. 部署 CoursePlatform 合约，使用 YDToken 地址
 * 3. 部署 AaveAdapter 合约（如果AAVE地址可用）
 */
const CoursePlatformModule = buildModule("CoursePlatformModule", (m) => {
  // 获取部署者地址作为初始拥有者
  const deployer = m.getAccount(0);

  // 平台收入地址（默认为部署者，可以后续更改）
  const platformTreasury = deployer;

  // 第一步：部署 YDToken 合约
  const ydToken = m.contract("YDToken", [deployer]);

  // 第二步：部署 CoursePlatform 合约，使用 YDToken 地址
  const coursePlatform = m.contract("CoursePlatform", [
    ydToken, 
    deployer, 
    platformTreasury
  ]);

  // AAVE V3 合约地址 (Sepolia testnet)
  // 注意：这些地址在不同网络上会不同，需要根据实际情况调整
  const aavePoolAddress = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"; // Sepolia AAVE V3 Pool
  const wethGatewayAddress = "0x387d311e47e80b498169e6fb51d3193167d89F7D"; // Sepolia WETH Gateway  
  const wethAddress = "0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c"; // Sepolia WETH

  // 第三步：部署 AaveAdapter 合约（暂时注释掉以避免gas问题）
  // const aaveAdapter = m.contract("AaveAdapter", [
  //   deployer,
  //   aavePoolAddress,
  //   wethGatewayAddress,
  //   wethAddress
  // ]);

  // 返回部署的合约实例，方便后续使用
  return {
    ydToken,
    coursePlatform,
    // aaveAdapter,
  };
});

export default CoursePlatformModule;
