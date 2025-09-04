import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * 课程平台部署模块
 * 
 * 此模块按正确顺序部署 YDToken 和 CoursePlatform 合约：
 * 1. 首先部署 YDToken 合约
 * 2. 使用 YDToken 地址部署 CoursePlatform 合约
 */
const CoursePlatformModule = buildModule("CoursePlatformModule", (m) => {
  // 获取部署者地址作为初始拥有者
  const deployer = m.getAccount(0);

  // 第一步：部署 YDToken 合约
  const ydToken = m.contract("YDToken", [deployer]);

  // 第二步：部署 CoursePlatform 合约，使用 YDToken 地址
  const coursePlatform = m.contract("CoursePlatform", [ydToken, deployer]);

  // 返回部署的合约实例，方便后续使用
  return {
    ydToken,
    coursePlatform,
  };
});

export default CoursePlatformModule;
