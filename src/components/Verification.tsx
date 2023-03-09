import { Identity } from "@semaphore-protocol/identity";
import { useEffect, useState } from "react";
import { generateProof } from "@semaphore-protocol/proof"
import { Group } from "@semaphore-protocol/group";
import { formatBytes32String } from "ethers/lib/utils"
import { Subgraph } from "@semaphore-protocol/subgraph";

export default function Verification() {
  const [_identity, setIdentity] = useState<Identity>();


  async function generate() {
    if (!_identity) {
      return;
    }

    const groupId = "91946953324073098644290635453078965791470981970818658206759845612371607109613";
    const depth = 20;
    const network = "goerli";

    const feedbackBytes32 = formatBytes32String("I'm a human");

    const subgraph = new Subgraph(network);
    const { members } = await subgraph.getGroup(groupId, { members: true });
    const group = new Group(groupId, depth);
    members && group.addMembers(members);
    const { proof, merkleTreeRoot, nullifierHash } = await generateProof(_identity, group, groupId, feedbackBytes32);

    console.log("proof:",proof)
    console.log("merkleTreeRoot:",merkleTreeRoot)
    console.log("nullifierHash:",nullifierHash)

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
