import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 1. 从 wagmi 和相关库中导入所需模块
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains"; // 我们将使用 Sepolia 测试网
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";

// 2. 创建 QueryClient 实例（wagmi v2 要求）
const queryClient = new QueryClient();

// 3. 创建 wagmi config
const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
  },
});

// 4. 用 WagmiProvider 和 QueryClientProvider 组件包裹我们的 App
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <App />
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
