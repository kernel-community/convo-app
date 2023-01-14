import { useSession } from "next-auth/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Layout from "src/layouts/Main";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAccount } from "wagmi";

function Signin() {
  const { data: session } = useSession();
  const { address } = useAccount();
  const router = useRouter();
  useEffect(() => {
    if (address && session) {
      router.push("/");
    }
  }, [address, session]);
  return (
    <Layout>
      <ConnectButton />
    </Layout>
  );
}

export default Signin;
