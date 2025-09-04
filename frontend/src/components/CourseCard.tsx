import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { ydTokenConfig, coursePlatformConfig } from "../contractConfig";
import apiClient from "../apiClient";

// 定义从后端和The Graph合并后的课程数据类型
interface Course {
  id: string; // The Graph 返回的 courseId
  title: string;
  description: string;
  creator: { id: string };
  priceInYd: string;
  purchaseCount: string;
  uuid?: string;
  chain_id?: string;
}

export function CourseCard({ course, onCourseDeleted }: { course: Course; onCourseDeleted?: () => void }) {
  const [isApproved, setIsApproved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { address } = useAccount();

  // --- 1. Approve 交易 ---
  const {
    data: approveHash,
    isPending: isApproving,
    writeContract: approve,
  } = useWriteContract();
  const { isLoading: isConfirmingApproval, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

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

  // --- 3. Delete 交易 ---
  const {
    data: deleteHash,
    isPending: isDeleting_tx,
    writeContract: deleteCourse,
  } = useWriteContract();
  const { isLoading: isConfirmingDelete, isSuccess: isDeleted } =
    useWaitForTransactionReceipt({
      hash: deleteHash,
    });

  // 监听授权成功状态
  useEffect(() => {
    if (isApprovalSuccess) {
      setIsApproved(true);
    }
  }, [isApprovalSuccess]);

  // 监听删除成功状态
  useEffect(() => {
    if (isDeleted) {
      // 删除链上合约成功后，同步删除链下数据
      const deleteOffChainData = async () => {
        try {
          await apiClient.delete(`/courses/${course.id}`);
          console.log(`Course ${course.title} deleted from backend`);
          onCourseDeleted?.(); // 通知父组件刷新列表
        } catch (error) {
          console.error('Failed to delete course from backend:', error);
        } finally {
          setIsDeleting(false);
        }
      };
      deleteOffChainData();
    }
  }, [isDeleted, course.id, course.title, onCourseDeleted]);

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

  const handleDelete = async () => {
    if (window.confirm(`确定要删除课程 "${course.title}" 吗？这个操作不可撤销。`)) {
      setIsDeleting(true);
      try {
        deleteCourse({
          ...coursePlatformConfig,
          functionName: "deleteCourse", 
          args: [BigInt(course.id)],
        });
      } catch (error) {
        console.error('Failed to delete course:', error);
        setIsDeleting(false);
      }
    }
  };

  // 检查是否是课程创建者
  const isCreator = address && course.creator.id.toLowerCase() === address.toLowerCase();
  const canDelete = isCreator && parseInt(course.purchaseCount) === 0;

  return (
    <div className="border border-gray-700 rounded-lg p-6 bg-gray-800 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold flex-1">{course.title}</h3>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting || isDeleting_tx || isConfirmingDelete}
              className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isDeleting || isDeleting_tx || isConfirmingDelete ? "删除中..." : "删除"}
            </button>
          )}
        </div>
        
        <p className="text-gray-400 mb-4 h-20 overflow-y-auto text-sm">
          {course.description}
        </p>
        
        <div className="space-y-1 text-sm">
          <p className="font-mono text-gray-500 break-words">
            Creator: {course.creator.id}
          </p>
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold text-blue-400">
              {formatEther(BigInt(course.priceInYd))} YD
            </p>
            <p className="text-sm text-green-400">
              👥 {course.purchaseCount} 人已购买
            </p>
          </div>
        </div>
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
