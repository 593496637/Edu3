import { useState } from "react";
import { useAccount } from "wagmi";
import axios from "axios";

const API_BASE_URL = "http://localhost:4000";

export function InstructorApplicationForm() {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    experience: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setMessage("请先连接钱包");
      setMessageType("error");
      return;
    }

    if (!formData.name || !formData.title) {
      setMessage("请填写必填字段");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/instructor-applications`, {
        applicant_address: address,
        name: formData.name,
        title: formData.title,
        experience: formData.experience,
      });

      setMessage("讲师申请提交成功！请等待管理员审核。");
      setMessageType("success");
      
      // 清空表单
      setFormData({
        name: "",
        title: "",
        experience: "",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "申请提交失败";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">申请成为讲师</h2>
        <p className="text-gray-300">请先连接钱包以申请成为认证讲师</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-white">申请成为认证讲师</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 钱包地址显示 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            钱包地址
          </label>
          <input
            type="text"
            value={address}
            disabled
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm"
          />
        </div>

        {/* 姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            姓名 *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="请输入您的姓名"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* 职称/头衔 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            职称/头衔 *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="例如：高级软件工程师、区块链专家、大学教授等"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* 教学经验 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            教学经验 (可选)
          </label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            placeholder="请简述您的教学经验、专业背景或相关资质..."
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-200"
        >
          {isSubmitting ? "提交中..." : "提交申请"}
        </button>
      </form>

      {/* 消息显示 */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            messageType === "success"
              ? "bg-green-900 text-green-300 border border-green-700"
              : "bg-red-900 text-red-300 border border-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* 说明 */}
      <div className="mt-6 p-4 bg-gray-900 rounded-md border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">申请说明：</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• 提交申请后，管理员将审核您的资质</li>
          <li>• 审核通过后，您将获得创建课程的权限</li>
          <li>• 请确保提供的信息真实有效</li>
        </ul>
      </div>
    </div>
  );
}