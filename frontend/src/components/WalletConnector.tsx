import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { formatUnits } from "viem";

export function WalletConnector() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="text-right">
        <p className="font-mono text-sm">Connected: {address}</p>
        <p className="font-mono text-sm">
          Balance: {balance ? formatUnits(balance.value, balance.decimals).substring(0, 6) : '0'} {balance?.symbol}
        </p>
        <button
          onClick={() => disconnect()}
          className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  );
}
