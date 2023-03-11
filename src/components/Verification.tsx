import { Identity } from "@semaphore-protocol/identity";
import { useEffect, useState } from "react";
import { generateProof } from "@semaphore-protocol/proof"
import { Group } from "@semaphore-protocol/group";
import { formatBytes32String } from "ethers/lib/utils"
import { Subgraph } from "@semaphore-protocol/subgraph";
import { useContract } from "wagmi";
import { useZkProofOfHumanity, useZkProofOfHumanityRead } from "@/generated/zk-poh-contract";
import { BigNumber } from "ethers/lib/ethers";
import { fetchSigner } from "@wagmi/core";
import { ethers } from "ethers";

export default function Verification() {
  const [_identity, setIdentity] = useState<Identity>();
  const zkpoh  = useZkProofOfHumanity();

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
   
    const groupIdString = groupId.toString();
    const depthNumber = depth.toNumber();
    const network = "goerli";
    const externalNullifier =  ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString()//generate a random;
    const signal = formatBytes32String("I'm a human");

    const subgraph = new Subgraph(network);
    const { members } = await subgraph.getGroup(groupIdString, { members: true });
    const group = new Group(groupIdString, depthNumber);
    members && group.addMembers(members);
    const { proof, merkleTreeRoot, nullifierHash } = await generateProof(_identity, group, externalNullifier, signal);

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

  useEffect(() => {
    const identityString = localStorage.getItem("identity");
    if (!identityString) {
      return;
    }
    setIdentity(new Identity(identityString));
  }, []);

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
