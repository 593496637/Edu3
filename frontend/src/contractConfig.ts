import CoursePlatformABI from "./contracts/CoursePlatform.json";
import YDTokenABI from "./contracts/YDToken.json";

// !! 重要提示 !!
// 下面的地址都是占位符。
// 在我们后面把合约部署到测试网后，需要回来用真实的合约地址替换它们。
export const COURSE_PLATFORM_ADDRESS =
  "0x537feaEaAe0B3B2dF87AfB3cA349C1fd118DbCf8";
export const YD_TOKEN_ADDRESS = "0x66d81ddC9259DEc4cD2FCEfd101C3AA29110FbF9";

export const coursePlatformConfig = {
  address: COURSE_PLATFORM_ADDRESS as `0x${string}`,
  abi: CoursePlatformABI.abi,
};

export const ydTokenConfig = {
  address: YD_TOKEN_ADDRESS as `0x${string}`,
  abi: YDTokenABI.abi,
};
