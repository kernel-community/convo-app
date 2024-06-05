import type { NextPage } from "next";
import { useQuery } from "react-query";
import Main from "src/layouts/Main";
import { useEffect } from "react";
import router from "next/router";
import { Button } from "src/components/ui/button";

const Google: NextPage = () => {
  const { isLoading, isError, data, refetch } = useQuery(
    `auth_google`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/actions/google/getGoogleAccessToken", {
              method: "POST",
              headers: { "Content-type": "application/json" },
            })
          ).json()
        ).data;
        return r;
      } catch (err) {
        throw err;
      }
    },
    {
      refetchInterval: 6000000000,
      enabled: false,
    }
  );
  const handleClick = () => refetch();

  useEffect(() => {
    if (data && !isLoading && !isError) {
      router.push(data);
    }
  }, [data, isLoading, isError]);
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
            <Button onClick={handleClick}>Get Google Access Token</Button>
          </div>
        </div>
      </Main>
    </>
  );
};

export default Google;
