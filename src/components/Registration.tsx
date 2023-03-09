import { usePrepareZkProofOfHumanityRegister, useZkProofOfHumanityRegister, zkProofOfHumanityAddress } from "@/generated/zk-poh-contract";
import { usePrepareRegister } from "@/hooks/usePrepareRegister";
import { Identity } from "@semaphore-protocol/identity";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { useNetwork } from "wagmi";
import { IdentityCreation } from "./IdentityCreation";

export default function Registration() {
  const [_identity, setIdentity] = useState<Identity>();

  const { config } = usePrepareRegister({
    args: [identityCommitment()],
    enabled: isAValidRegister(),
  });

  const {write} = useZkProofOfHumanityRegister(config)

  function isAValidRegister() {
    return _identity != undefined;
  }

  function identityCommitment(): BigNumber {
    return _identity?.commitment ? BigNumber.from(_identity.commitment) : BigNumber.from(0);
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
      {_identity ? (
        <>
          <button disabled={!write} onClick={write}>Register</button>
        </>
      ) : (
        <IdentityCreation />
      )}
    </>
  );
}
