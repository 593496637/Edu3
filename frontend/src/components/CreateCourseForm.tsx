import { useState } from "react";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { coursePlatformConfig } from "../contractConfig";
import { createCourseAPI } from "../apiClient";

export function CreateCourseForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const { address } = useAccount();

  // 1. 使用最新的 useWriteContract Hook
  const { data: hash, isPending, writeContract } = useWriteContract();

  // 2. 使用最新的 useWaitForTransactionReceipt Hook
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // 表单提交处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !address) {
      alert("Please fill all fields and connect your wallet.");
      return;
    }

    try {
      // 步骤 1: 调用后端API，保存元数据
      console.log("Step 1: Sending metadata to backend...");
      const apiResponse = await createCourseAPI({
        title,
        description,
        creator_address: address,
      });

      console.log("Backend response:", apiResponse);
      const courseIdForChain = BigInt(apiResponse.courseIdForChain);

      // 步骤 2: 直接调用 writeContract 发起链上交易
      console.log(
        `Step 2: Calling smart contract with courseId: ${courseIdForChain}`
      );
      writeContract({
        ...coursePlatformConfig,
        functionName: "createCourse",
        args: [courseIdForChain, parseEther(price || "0")],
      });
    } catch (error) {
      alert("Failed to save course metadata.");
      console.error(error);
    }
  };

  return (
    <div className="p-8 border border-gray-700 rounded-lg bg-gray-800">
      <h2 className="text-2xl font-bold mb-4">Create a New Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Price (in YD Token)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-500"
        >
          {isPending ? "Check Wallet..." : "Create Course"}
        </button>
      </form>

      {hash && (
        <div className="mt-4 text-sm break-words">Transaction Hash: {hash}</div>
      )}
      {isConfirming && (
        <div className="mt-4 text-yellow-400">Waiting for confirmation...</div>
      )}
      {isConfirmed && (
        <div className="mt-4 text-green-400">
          Transaction confirmed successfully!
        </div>
      )}
    </div>
  );
}
