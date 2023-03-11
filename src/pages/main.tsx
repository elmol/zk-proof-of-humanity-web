import Registration from '@/components/Registration'
import { useZkProofOfHumanity } from '@/generated/zk-poh-contract'
import { Identity } from '@semaphore-protocol/identity'
import { verifyMessage } from 'ethers/lib/utils.js'
import { useEffect, useState } from 'react'
import NoSSR from 'react-no-ssr'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { goerli, localhost } from 'wagmi/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import styles from "@/styles/Home.module.css";
import Verification from '@/components/Verification'

const message = "zk-proof-of-humanity";

export function IdentityCreation() {
  const [_identity, setIdentity] = useState<Identity>();
  const [_recoveredAddress,setAddress] = useState<string>();
  

  const { data, error, isLoading, signMessage } = useSignMessage({
    message,
    onSuccess(data, variables) {
      const address = verifyMessage(variables.message, data);
      setAddress(address);
      const identity = new Identity(data);
      setIdentity(identity);
      localStorage.setItem("identity", identity.toString());
    },
  });

  return (
    <>
      <button disabled={isLoading} onClick={() => signMessage()}>
        {isLoading ? "Check Wallet" : "Identity"}
      </button>

      <div>Loading: {isLoading.toString()}</div>
      {data && (
        <div>
          <div>Recovered Address: {_recoveredAddress}</div>
          <div>Identity Commitment: {_identity?.commitment.toString()}</div>
        </div>
      )}
      {error && <div>{error.message}</div>}
    </>
  );
}




export default function Main() {
  const { address, isConnected } = useAccount()

  const { connect } = useConnect({
    connector: new InjectedConnector({
      chains: [goerli, localhost],
    }),
  })
  const { disconnect } = useDisconnect()
  const contract = useZkProofOfHumanity();
  
  const isHuman = false; // TODO: get humanity from PoH contract
  const isRegistered = true //TODO: get if is register in zkPoH
  const isRegisteredIdentity = true //TODO: verify if it's a register identity in zkPoH
  const [_identity, setIdentity] = useState<Identity>();


  useEffect(() => {
    const identityString = localStorage.getItem("identity");
    if (!identityString) {
      return;
    }
    setIdentity(new Identity(identityString));
  }, []);


  return (
    <>
      <NoSSR>
        { isConnected ? (
          <div>
              <div> Zk Proof of Humanity Contract: {contract?.address}</div>
              <div> Connected to {address}  { isHuman ?  "🧑" : "🤖"} <button onClick={() => disconnect()}>Disconnect</button> </div>
              <div>-------------------------------------------------------------------------------------------------------------</div>

              {isHuman  && !_identity && (<div>Generate Identity - No identity set for human</div>)}
              {isHuman  && !_identity && (<div><IdentityCreation/></div>)}
             


              {isHuman  &&  _identity &&  isRegistered && (<div>Human Registered - Connect with burner account to signal</div>)}
              {isHuman  &&  _identity && !isRegistered && (<div>Human Not Registered - Please Register</div>)}
              {isHuman  &&  _identity && (<div> <Registration/> </div>)}
             
              {!isHuman && !_identity && (<div>No Human Account - Connect with human account to generate identity</div>)}
              {!isHuman &&  _identity && (<div> <Verification/></div>)}
              {!isHuman &&  _identity && !isRegisteredIdentity && (<div>Identity Not Registered in ZkPoH - connect with human account and register</div>)}
              {!isHuman &&  _identity && isRegisteredIdentity && (<div>Identity registered - Verify Proof</div>)}
          
          </div>
        ) : (<button onClick={() => connect()}>Connect Wallet</button>)}
      </NoSSR>
    </>
  )
}