import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";

const useWallet = () => {
  const { data } = useSession();
  const { isDisconnected } = useAccount();

  return {
    // will return cached value in case wallet is disconnected
    wallet: data?.user.address,
    isSignedIn: !isDisconnected,
  };
};

export default useWallet;
