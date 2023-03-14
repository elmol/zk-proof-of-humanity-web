import { Identity } from "@semaphore-protocol/identity";
import { verifyMessage } from "ethers/lib/utils";
import { SetStateAction, useState } from "react";
import { useSignMessage } from "wagmi";

const message = "zk-proof-of-humanity";

type Props = {
  handleNewIdentity: (credential:{ identity: Identity, address: `0x${string}`}) => void
};


export function IdentityGeneration(props:Props) {    

  const { data, error, isLoading, signMessage } = useSignMessage({
    message,
    onSuccess(data, variables) {
      const identity = new Identity(data);
      const address = verifyMessage(variables.message, data);
      props.handleNewIdentity({identity:identity, address:address as`0x${string}`});
    },
  });

  return (
    <>
      <button disabled={isLoading} onClick={() => signMessage()}>
        {isLoading ? "Check Wallet" : "Identity"}
      </button>
      {/* {data && (address as`0x${string}`
        <div>
        </div>
      )}
      {error && <div>{error.message}</div>} */}
    </>
  );
}
