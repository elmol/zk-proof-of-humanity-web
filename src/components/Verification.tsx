import { Identity } from "@semaphore-protocol/identity";
import { useEffect, useState } from "react";
import { generateProof } from "@semaphore-protocol/proof"
import { Group } from "@semaphore-protocol/group";
import { formatBytes32String } from "ethers/lib/utils"
import { Subgraph } from "@semaphore-protocol/subgraph";
import { useContract } from "wagmi";
import { useZkProofOfHumanity } from "@/generated/zk-poh-contract";
import { BigNumber } from "ethers/lib/ethers";
import { fetchSigner } from "@wagmi/core";

export default function Verification() {
  const [_identity, setIdentity] = useState<Identity>();
  const zkpoh  = useZkProofOfHumanity();

  async function generate() {
    if (!_identity) {
      return;
    }

    const groupId = "91946953324073098644290635453078965791470981970818658206759845612371607109613";
    const depth = 20;
    const network = "goerli";
    const externalNullifier = groupId;

    const feedbackBytes32 = formatBytes32String("I'm a human");

    const subgraph = new Subgraph(network);
    const { members } = await subgraph.getGroup(groupId, { members: true });
    const group = new Group(groupId, depth);
    members && group.addMembers(members);
    const { proof, merkleTreeRoot, nullifierHash } = await generateProof(_identity, group, externalNullifier, feedbackBytes32);

    console.log("proof:",proof)
    console.log("merkleTreeRoot:",merkleTreeRoot)
    console.log("nullifierHash:",nullifierHash)

    if (zkpoh) {
      const signer = await fetchSigner();
      if(!signer) return;
      const tx = await zkpoh.connect(signer).verifyProof(BigNumber.from(merkleTreeRoot), BigNumber.from(feedbackBytes32), BigNumber.from(nullifierHash), BigNumber.from(externalNullifier), [
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
          <button onClick={generate}>Verify Humanity</button>
        </>
      ) }
    </>
  );
}
