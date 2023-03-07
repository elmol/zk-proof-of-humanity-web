import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { SignMessage } from './Sign'
 
export default function Profile() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()
 
  if (isConnected)
    return (
      <div>
        <div> Connected to {address} <button onClick={() => disconnect()}>Disconnect</button> </div>
        <div> <SignMessage /> </div>
      </div>
    )
  return <button onClick={() => connect()}>Connect Wallet</button>
}