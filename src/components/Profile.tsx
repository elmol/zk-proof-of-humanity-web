import { useZkProofOfHumanity } from '@/generated/zk-poh-contract'
import NoSSR from 'react-no-ssr'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { IdentityCreation } from './IdentityCreation'
import { localhost, goerli } from 'wagmi/chains'
import Registration from './Registration'
import Verification from './Verification'

export default function Profile() {
  const { address, isConnected } = useAccount()

  const { connect } = useConnect({
    connector: new InjectedConnector({
      chains: [goerli, localhost],
    }),
  })
  
  const { disconnect } = useDisconnect()
  const contract = useZkProofOfHumanity();
 
  return (
    <>
      <NoSSR>
        { isConnected ? (
          <div>
              <div> Connected to {address} <button onClick={() => disconnect()}>Disconnect</button> </div>
              <div> Contract: {contract?.address}</div>
              <div> <Registration/> </div>
              <div> <Verification/></div>
          </div>
        ) : (<button onClick={() => connect()}>Connect Wallet</button>)}
      </NoSSR>
    </>
  )
}