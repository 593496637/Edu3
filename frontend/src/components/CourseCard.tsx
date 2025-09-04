import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { ydTokenConfig, coursePlatformConfig } from "../contractConfig";

// 定义从后端和The Graph合并后的课程数据类型
interface Course {
  id: string; // The Graph 返回的 courseId
  title: string;
  description: string;
  creator: { id: string };
  priceInYd: string;
}

export function CourseCard({ course }: { course: Course }) {
  const [isApproved, setIsApproved] = useState(false);

  // --- 1. Approve 交易 ---
  const {
    data: approveHash,
    isPending: isApproving,
    writeContract: approve,
  } = useWriteContract();
  const { isLoading: isConfirmingApproval, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // 监听授权成功状态
  useEffect(() => {
    if (isApprovalSuccess) {
      setIsApproved(true);
    }
  }, [isApprovalSuccess]);

  // --- 2. Purchase 交易 ---
  const {
    data: purchaseHash,
    isPending: isPurchasing,
    writeContract: purchase,
  } = useWriteContract();
  const { isLoading: isConfirmingPurchase, isSuccess: isPurchased } =
    useWaitForTransactionReceipt({
      hash: purchaseHash,
    });

  const handleApprove = () => {
    approve({
      ...ydTokenConfig,
      functionName: "approve",
      args: [
        coursePlatformConfig.address,
        parseEther(formatEther(BigInt(course.priceInYd))),
      ],
    });
  };

  const handlePurchase = () => {
    purchase({
      ...coursePlatformConfig,
      functionName: "purchaseCourse",
      args: [BigInt(course.id)],
    });
  };

  return (
    <div className="border border-gray-700 rounded-lg p-6 bg-gray-800 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold mb-2">{course.title}</h3>
        <p className="text-gray-400 mb-4 h-24 overflow-y-auto">
          {course.description}
        </p>
        <p className="text-sm font-mono text-gray-500 break-words">
          Creator: {course.creator.id}
        </p>
        <p className="text-lg font-semibold mt-2">
          {formatEther(BigInt(course.priceInYd))} YD
        </p>
      </div>
      <div className="mt-6">
        {isPurchased ? (
          <p className="text-green-400 font-bold">You own this course!</p>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={handleApprove}
              disabled={isApproved || isApproving || isConfirmingApproval}
              className="flex-1 px-4 py-2 font-bold text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isApproving || isConfirmingApproval
                ? "Approving..."
                : "1. Approve"}
            </button>
            <button
              onClick={handlePurchase}
              disabled={!isApproved || isPurchasing || isConfirmingPurchase}
              className="flex-1 px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isPurchasing || isConfirmingPurchase
                ? "Purchasing..."
                : "2. Purchase"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
