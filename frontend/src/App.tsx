import { WalletConnector } from "./components/WalletConnector";
import { CreateCourseForm } from "./components/CreateCourseForm";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Web3 University</h1>
        <WalletConnector />
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="md:col-span-1">
          <CreateCourseForm />
        </div>
        <div className="md:col-span-1">
          {/* 这里将是课程列表 */}
          <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
          <p>Course marketplace coming soon...</p>
        </div>
      </main>
    </div>
  );
}

export default App;
