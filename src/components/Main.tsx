import Registration from '@/components/Registration'
import { useZkProofOfHumanity, useZkProofOfHumanityRead, useZkProofOfHumanityRegister } from '@/generated/zk-poh-contract'
import { Identity } from '@semaphore-protocol/identity'
import { BytesLike, verifyMessage } from 'ethers/lib/utils.js'
import { useEffect, useState } from 'react'
import NoSSR from 'react-no-ssr'
import { useAccount, useConnect, useContractRead, useDisconnect, useSignMessage } from 'wagmi'
import { goerli, localhost } from 'wagmi/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import Verification from '@/components/Verification'
import { usePrepareRegister } from '@/hooks/usePrepareRegister'
import { BigNumber } from 'ethers/lib/ethers'

const message = "zk-proof-of-humanity";




export default function Main() {

  function ZKPoHRegistration() {
  
    const { config } = usePrepareRegister({
      args: [identityCommitment()],
      enabled:_identity != undefined&&!isRegistered,
    });
  
    const {write} = useZkProofOfHumanityRegister({
      ...config,
      onSuccess(data) {
        console.log('Success', data)
      },
    })
  
    function identityCommitment(): BigNumber {
      return _identity?.commitment ? BigNumber.from(_identity.commitment) : BigNumber.from(0);
    }
  
    return (
      <>
        {_identity ? (
          <>
            <button disabled={!write} onClick={write}>Register</button>
          </>
        ) : (
          <div>Identity not generated -  Please generate identity</div>
        )}
      </>
    );
  }
  


  function IdentityGeneration() {    
  
    const { data, error, isLoading, signMessage } = useSignMessage({
      message,
      onSuccess(data, variables) {
        const identity = new Identity(data);
        setIdentity(identity);
        const address = verifyMessage(variables.message, data);
        setAddressIdentity(address as`0x${string}` );
      },
    });
  
    return (
      <>
        <button disabled={isLoading} onClick={() => signMessage()}>
          {isLoading ? "Check Wallet" : "Identity"}
        </button>
        {data && (
          <div>
            <div>Recovered Address: {_addressIdentity}</div>
            <div>Identity Commitment: {_identity?.commitment.toString()}</div>
          </div>
        )}
        {error && <div>{error.message}</div>}
      </>
    );
  }
  



  const { address, isConnected } = useAccount()

  const { connect } = useConnect({
    connector: new InjectedConnector({
      chains: [goerli, localhost],
    }),
  })
  const { disconnect } = useDisconnect();

  const contract = useZkProofOfHumanity();
  

  /////////// IS HUMAN
  const {data:pohAddress}= useZkProofOfHumanityRead({
    functionName: 'poh',
  });  
  const { data:isHuman, isError, isLoading } = useContractRead({
    address: pohAddress,
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_submissionID",
            "type": "address"
          }
        ],
        "name": "isRegistered",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'isRegistered',
    args: [!address?"0x00":address], //TODO review
    enabled:pohAddress&&address?true:false
  })

  /////////// IS REGISTERED ACCOUNT
  const {data:isRegistered}= useZkProofOfHumanityRead({
    functionName: 'isRegistered',
    args: [!address?"0x00":address], //TODO review
    enabled: address?true:false,
    watch:true
  });

  /////////// IS REGISTERED ENTITY
  const [_addressIdentity, setAddressIdentity] = useState<`0x${string}` | undefined>();
  const {data:isRegisteredIdentity}= useZkProofOfHumanityRead({
        functionName: 'isRegistered',
        args: [!_addressIdentity?"0x00":_addressIdentity], //TODO review
        enabled: _addressIdentity?true:false,
        watch:true
   });

  const [_identity, setIdentity] = useState<Identity>();

   return (
    <>
      <NoSSR>
        { isConnected ? (
          <div>
              <div> Zk Proof of Humanity Contract: {contract?.address}</div>
              <div> Connected to {address}  { isHuman ?  "🧑" : "🤖"} <button onClick={() => disconnect()}>Disconnect</button> </div>
              <div>-------------------------------------------------------------------------------------------------------------</div>
              {_identity && (
                <>
                  <div>Recovered Address: {_addressIdentity}</div>
                  <div>Identity Commitment: {_identity?.commitment.toString()}</div>
                  <div>-------------------------------------------------------------------------------------------------------------</div>
                </>
              )} 

              {isHuman  && !_identity && (<div>Generate Identity - No identity set for human</div>)}
              {isHuman  && !_identity && (<div><IdentityGeneration/></div>)}
             


              {isHuman  &&  _identity &&  isRegistered && (<div>Human Registered - Connect with burner account to signal</div>)}
              
              {isHuman  &&  _identity && !isRegistered && (<div>Human Not Registered - Please Register</div>)}
              {isHuman  &&  _identity && !isRegistered && (<div> <ZKPoHRegistration/> </div>)}
             
              {!isHuman && !_identity && (<div>No Human Account - Connect with human account to generate identity</div>)}
              {!isHuman &&  _identity && !isRegisteredIdentity && (<div>Identity Not Registered in ZkPoH - connect with human account and register</div>)}
              {!isHuman &&  _identity && isRegisteredIdentity && (<div>Identity registered - Verify Proof</div>)}
              {!isHuman &&  _identity && isRegisteredIdentity && (<div> <Verification identity={_identity}/> </div>)}
          
          </div>
        ) : (<button onClick={() => connect()}>Connect Wallet</button>)}
      </NoSSR>
    </>
  )
}