import { WalletConnector } from "./components/WalletConnector";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">Web3 University</h1>
        <WalletConnector />
      </header>

      <main className="w-full max-w-5xl">
        {/* 未来的课程列表和创建表单将放在这里 */}
        <p>Welcome to the future of decentralized learning.</p>
      </main>
    </div>
  );
}

export default App;
