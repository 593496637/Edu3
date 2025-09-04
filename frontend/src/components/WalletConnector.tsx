import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { mainnet, sepolia, polygon, arbitrum, base } from "wagmi/chains";

const supportedChains = [sepolia, mainnet, polygon, arbitrum, base];

const chainIcons: Record<number, string> = {
  [mainnet.id]: "🔹",
  [sepolia.id]: "🔸",
  [polygon.id]: "🟣",
  [arbitrum.id]: "🔵", 
  [base.id]: "🔷"
};

export function WalletConnector() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const currentChain = supportedChains.find(chain => chain.id === chainId);
  
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance: { value: bigint; decimals: number; symbol: string } | undefined) => {
    if (!balance) return "0.000";
    const formatted = formatUnits(balance.value, balance.decimals);
    return parseFloat(formatted).toFixed(4);
  };

  if (isConnected && address) {
    return (
      <>
        <div className="relative">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 transition-colors duration-200 rounded-2xl px-4 py-3 border border-gray-600"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{chainIcons[chainId] || "⚡"}</span>
              <span className="text-sm font-medium">{currentChain?.name || "Unknown"}</span>
            </div>
            <div className="w-px h-6 bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {address.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatAddress(address)}</div>
                <div className="text-xs text-gray-400">
                  {formatBalance(balance)} {balance?.symbol || "ETH"}
                </div>
              </div>
            </div>
          </button>

          {/* Account Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 w-96" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Account</h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {address.slice(2, 4).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-mono text-sm">{formatAddress(address)}</div>
                    <div className="text-sm text-gray-400">Connected</div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Balance</span>
                    <span className="font-semibold">
                      {formatBalance(balance)} {balance?.symbol || "ETH"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsNetworkModalOpen(true);
                    setIsModalOpen(false);
                  }}
                  className="w-full mb-3 flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition-colors duration-200 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{chainIcons[chainId] || "⚡"}</span>
                    <span>{currentChain?.name || "Unknown Network"}</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button
                  onClick={() => {
                    disconnect();
                    setIsModalOpen(false);
                  }}
                  className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors duration-200 rounded-xl px-4 py-3"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* Network Selection Modal */}
          {isNetworkModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsNetworkModalOpen(false)}>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 w-96" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Select Network</h3>
                  <button 
                    onClick={() => setIsNetworkModalOpen(false)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-2">
                  {supportedChains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => {
                        switchChain({ chainId: chain.id });
                        setIsNetworkModalOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors duration-200 ${
                        chainId === chain.id
                          ? "bg-blue-600/20 border border-blue-600"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{chainIcons[chain.id]}</span>
                        <span className="font-medium">{chain.name}</span>
                      </div>
                      {chainId === chain.id && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white font-semibold py-3 px-6 rounded-2xl"
      >
        Connect Wallet
      </button>

      {/* Connect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 w-96" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Connect Wallet</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector });
                    setIsModalOpen(false);
                  }}
                  disabled={isPending}
                  className="w-full flex items-center space-x-4 p-4 bg-gray-800 hover:bg-gray-700 transition-colors duration-200 rounded-xl disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {connector.name.slice(0, 2)}
                    </span>
                  </div>
                  <span className="font-medium">{connector.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 text-xs text-gray-400 text-center">
              By connecting a wallet, you agree to the Terms of Service
            </div>
          </div>
        </div>
      )}
    </>
  );
}
