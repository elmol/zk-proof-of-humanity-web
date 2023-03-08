import { Identity } from "@semaphore-protocol/identity";
import { verifyMessage } from "ethers/lib/utils";
import { useState } from "react";
import { useSignMessage } from "wagmi";

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
