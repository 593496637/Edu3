import { useState } from "react";
import { WalletConnector } from "./components/WalletConnector";
import { CreateCourseForm } from "./components/CreateCourseForm";
import { CourseList } from "./components/CourseList";
import { InstructorApplicationForm } from "./components/InstructorApplicationForm";
import { MyApplicationStatus } from "./components/MyApplicationStatus";

function App() {
  const [activeTab, setActiveTab] = useState<"courses" | "apply" | "status" | "create">("courses");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Web3 University</h1>
        <WalletConnector />
      </header>

      {/* 导航标签 */}
      <nav className="w-full max-w-7xl mx-auto mb-8">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "courses"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            课程列表
          </button>
          <button
            onClick={() => setActiveTab("apply")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "apply"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            申请成为讲师
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "status"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            申请状态
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "create"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
          >
            创建课程
          </button>
        </div>
      </nav>

      <main className="w-full max-w-7xl mx-auto">
        {activeTab === "courses" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">
              Available Courses
            </h2>
            <CourseList />
          </div>
        )}

        {activeTab === "apply" && <InstructorApplicationForm />}

        {activeTab === "status" && <MyApplicationStatus />}

        {activeTab === "create" && (
          <div>
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">
              创建新课程
            </h2>
            <CreateCourseForm />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
