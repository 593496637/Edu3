import CoursePlatformABI from './contracts/CoursePlatform.json';

// !! 重要提示 !!
// 下面的地址是一个占位符。
// 在我们后面把合约部署到测试网后，需要回来用真实的合约地址替换它。
export const COURSE_PLATFORM_ADDRESS = '0xYourCoursePlatformContractAddressHere';

export const coursePlatformConfig = {
  address: COURSE_PLATFORM_ADDRESS as `0x${string}`,
  abi: CoursePlatformABI.abi,
};