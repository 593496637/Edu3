import { WalletConnector } from "./components/WalletConnector";
import { CreateCourseForm } from "./components/CreateCourseForm";
import { CourseList } from "./components/CourseList";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Web3 University</h1>
        <WalletConnector />
      </header>

      <main className="w-full max-w-7xl mx-auto">
        <div className="mb-12">
          <CreateCourseForm />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">
            Available Courses
          </h2>
          <CourseList />
        </div>
      </main>
    </div>
  );
}

export default App;
