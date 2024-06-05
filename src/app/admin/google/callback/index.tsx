"use client";

import type { NextPage } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "react-query";
import Main from "src/layouts/Main";

const GoogleAuthCallback: NextPage = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { refetch } = useQuery(
    `auth_callback_google`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/actions/google/callback", {
              method: "POST",
              headers: { "Content-type": "application/json" },
              body: JSON.stringify({ code }),
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

  useEffect(() => {
    if (code) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

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
            Stored token. Head back
            <Link href={"/"}>Home</Link>
          </div>
        </div>
      </Main>
    </>
  );
};

export default GoogleAuthCallback;
