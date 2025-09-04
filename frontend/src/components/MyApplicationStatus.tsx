import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import axios from "axios";

const API_BASE_URL = "http://localhost:4000";

interface Application {
  id: number;
  applicant_address: string;
  name: string;
  title: string;
  experience: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
  reviewed_at: string;
  reviewed_by: string;
}

export function MyApplicationStatus() {
  const { address, isConnected } = useAccount();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isConnected && address) {
      fetchMyApplications();
    }
  }, [isConnected, address]);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/instructor-applications/my/${address}`);
      setApplications(response.data);
      setError("");
    } catch (err: any) {
      setError("加载申请状态失败");
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: '待审核',
          bgColor: 'bg-yellow-900',
          textColor: 'text-yellow-300',
          borderColor: 'border-yellow-700'
        };
      case 'approved':
        return {
          text: '已批准',
          bgColor: 'bg-green-900',
          textColor: 'text-green-300',
          borderColor: 'border-green-700'
        };
      case 'rejected':
        return {
          text: '已拒绝',
          bgColor: 'bg-red-900',
          textColor: 'text-red-300',
          borderColor: 'border-red-700'
        };
      default:
        return {
          text: status,
          bgColor: 'bg-gray-900',
          textColor: 'text-gray-300',
          borderColor: 'border-gray-700'
        };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">我的申请状态</h2>
        <p className="text-gray-300">请先连接钱包以查看申请状态</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">我的申请状态</h2>
        <p className="text-gray-300">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">我的申请状态</h2>
        <p className="text-red-300">{error}</p>
        <button
          onClick={fetchMyApplications}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-white">我的申请状态</h2>
      
      {applications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-4">您还没有提交过讲师申请</p>
          <p className="text-sm text-gray-400">
            申请成为认证讲师后才能创建课程
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusStyle = getStatusDisplay(app.status);
            
            return (
              <div key={app.id} className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                    <p className="text-gray-300">{app.title}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor}`}
                  >
                    {statusStyle.text}
                  </span>
                </div>

                {app.experience && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">教学经验：</h4>
                    <p className="text-sm text-gray-400 bg-gray-800 p-3 rounded-md">
                      {app.experience}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">申请时间：</span>
                    <span className="text-gray-300 ml-2">{formatDate(app.created_at)}</span>
                  </div>
                  {app.reviewed_at && (
                    <div>
                      <span className="text-gray-400">审核时间：</span>
                      <span className="text-gray-300 ml-2">{formatDate(app.reviewed_at)}</span>
                    </div>
                  )}
                </div>

                {app.admin_notes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">管理员备注：</h4>
                    <p className="text-sm text-gray-400 bg-gray-800 p-3 rounded-md border-l-4 border-blue-500">
                      {app.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={fetchMyApplications}
        className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
      >
        刷新状态
      </button>
    </div>
  );
}