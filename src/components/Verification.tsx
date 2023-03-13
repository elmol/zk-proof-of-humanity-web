import { Identity } from "@semaphore-protocol/identity";
import { useEffect, useState } from "react";
import { generateProof } from "@semaphore-protocol/proof"
import { Group } from "@semaphore-protocol/group";
import { formatBytes32String } from "ethers/lib/utils"
import { Network, SemaphoreEthers, SemaphoreSubgraph } from "@semaphore-protocol/data";
import { useContract, useNetwork } from "wagmi";
import { useZkProofOfHumanity, useZkProofOfHumanityRead } from "@/generated/zk-poh-contract";
import { BigNumber } from "ethers/lib/ethers";
import { fetchSigner } from "@wagmi/core";
import { ethers } from "ethers";




export class ZkPoHApi {
  constructor(
      public readonly groupId: string,
      public readonly depth: number = 20,
      public readonly network: Network | "localhost" = "goerli",
      public readonly semaphoreAddress: string | undefined = undefined
  ) {}
  async generateZKPoHProof(identity: Identity, externalNullifier: string, signal: string) {
      const members = await this.getGroupMembers()
      const group = new Group(this.groupId, this.depth)
      members && group.addMembers(members)
      return await generateProof(identity, group, externalNullifier, signal)
  }

  private async getGroupMembers() {
      if ("localhost" == this.network) {
          const semaphoreEthers = new SemaphoreEthers("http://localhost:8545", {
              address: this.semaphoreAddress
          })
          return await semaphoreEthers.getGroupMembers(this.groupId)
      }
      const subgraph = new SemaphoreSubgraph(this.network)
      const { members } = await subgraph.getGroup(this.groupId, { members: true })
      return members
  }
}


type Props = {
  identity: Identity;
};


export default function Verification(props:Props) {
  const _identity = props.identity;

  const zkpoh  = useZkProofOfHumanity();
  const { chain } = useNetwork()
  
  async function generate() {
    if (!_identity) {
      return;
    }

    if(!groupId) {
      return;
    }

    if(!depth) {
      return
    }

    if(!chain) {
      return
    }
   
    const groupIdString = groupId.toString();
    const depthNumber = depth.toNumber();
    const network = chain.network as Network | "localhost";
    const externalNullifier =  ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString()//generate a random;
    const signal = formatBytes32String("I'm a human");
    console.log(network)
    console.log(semaphoreAddress)
    // const subgraph = new SemaphoreSubgraph(network);
    // const { members } = await subgraph.getGroup(groupIdString, { members: true });
    // const group = new Group(groupIdString, depthNumber);
    // members && group.addMembers(members);
    // const { proof, merkleTreeRoot, nullifierHash } = await generateProof(_identity, group, externalNullifier, signal);

    const api = network=="localhost"?new ZkPoHApi(groupIdString,depthNumber, network,semaphoreAddress):new ZkPoHApi(groupIdString,depthNumber);
    
    const { proof, merkleTreeRoot, nullifierHash } = await  api.generateZKPoHProof(_identity,externalNullifier,signal)
    console.log("proof:",proof)
    console.log("merkleTreeRoot:",merkleTreeRoot)
    console.log("nullifierHash:",nullifierHash)

    if (zkpoh) {
      const signer = await fetchSigner();
      if(!signer) return;
      const tx = await zkpoh.connect(signer).verifyProof(BigNumber.from(merkleTreeRoot), BigNumber.from(signal), BigNumber.from(nullifierHash), BigNumber.from(externalNullifier), [
        BigNumber.from(proof[0]),
        BigNumber.from(proof[1]),
        BigNumber.from(proof[2]),
        BigNumber.from(proof[3]),
        BigNumber.from(proof[4]),
        BigNumber.from(proof[5]),
        BigNumber.from(proof[6]),
        BigNumber.from(proof[7]),
      ]);
      await tx.wait();
      console.log("tx send", tx)
    }
    

  }

  // should be moved to register component
  const {data:groupId}= useZkProofOfHumanityRead({
     functionName: 'groupId',
  });
  
    // should be moved to register component
    const {data:depth}= useZkProofOfHumanityRead({
      functionName: 'depth',
   });

  // should be moved to register component
  const {data:semaphoreAddress}= useZkProofOfHumanityRead({
    functionName: 'semaphore',
 });


  // useEffect(() => {
  //   const identityString = localStorage.getItem("identity");
  //   if (!identityString) {
  //     return;
  //   }
  //   setIdentity(new Identity(identityString));
  // }, []);

  return (
    <>
      {_identity && (
        <>
          <div> GroupId: {groupId?.toString()} </div>
          <button onClick={generate}>Verify Humanity</button>
        </>
      ) }
    </>
  );
}
