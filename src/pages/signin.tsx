import { useSession } from "next-auth/react";
import Layout from "src/layouts/Main";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import LoginButton from "src/components/LoginButton";

function Signin() {
  const { data: session } = useSession();
  const { address } = useAccount();
  const router = useRouter();
  useEffect(() => {
    if (address && session) {
      const redirect = router.query.callbackUrl || "/";
      router.push(redirect as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, session]);
  return (
    <Layout>
      <LoginButton />
    </Layout>
  );
}

export default Signin;
