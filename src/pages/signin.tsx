import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Main from "src/layouts/Main";
import LoginButton from "src/components/LoginButton";
import { isAdmin } from "src/utils/isAdmin";

function Signin() {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (isAdmin(session?.user.address) && session) {
      const redirect = router.query.callbackUrl || "/";
      router.push(redirect as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Not an Admin, please disconnect and
  // connect with an admin account
  if (!isAdmin(session?.user.address) && session) {
    return (
      <>
        <Main className="mx-auto px-4">
          <div
            className="
          pl-6
          md:px-12
          lg:px-32
        "
          >
            <div className="flex flex-col items-center justify-center">
              Not an Admin, please disconnect and connect with an admin account
            </div>
          </div>
        </Main>
      </>
    );
  }

  // Login Screen
  return (
    <>
      <Main className="mx-auto px-4">
        <div
          className="
          pl-6
          md:px-12
          lg:px-32
        "
        >
          <div className="flex flex-col items-center justify-center">
            <LoginButton />
          </div>
        </div>
      </Main>
    </>
  );
}

export default Signin;
