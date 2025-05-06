"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Main from "src/layouts/Main";
import { Events } from "src/components/Events";
import CursorsContextProvider from "src/context/CursorsContext";
import SharedSpace from "src/components/SharedSpace";
import type { EventsRequest } from "src/types";

const Archive: NextPage = () => {
  const searchParams = useSearchParams();
  const userNickname = searchParams.get("user");
  const [filterObject, setFilterObject] = useState<
    EventsRequest["filter"] | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const host = process.env.NEXT_PUBLIC_PARTYKIT_SERVER_HOST || "";

  // Set up filter when user parameter is present
  useEffect(() => {
    // Reset filter when parameters change to avoid mixing results
    setFilterObject(undefined);

    if (userNickname) {
      setIsLoading(true);
      // First, try to fetch the user ID from the nickname
      const fetchUserIdFromNickname = async () => {
        try {
          console.log(`Fetching user data for nickname: ${userNickname}`);
          const response = await fetch(
            `/api/query/user-by-nickname?nickname=${encodeURIComponent(
              userNickname
            )}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.id) {
              // Create a filter for past events proposed by this specific user
              const newFilter = {
                nickname: userNickname,
                userId: data.data.id,
              };
              console.log("Setting filter for user's past events:", newFilter);
              setFilterObject(newFilter);
            } else {
              console.error("User data found but missing ID:", data);
            }
          } else {
            console.error("Failed to fetch user data:", response.status);
          }
        } catch (error) {
          console.error("Error fetching user by nickname:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserIdFromNickname();
    }
  }, [userNickname]); // Depend only on userNickname to avoid re-runs

  return (
    <>
      <CursorsContextProvider host={host} roomId="archive">
        <SharedSpace>
          <Main>
            <div className="px-6 md:px-12 lg:px-32">
              <div className="dark:text-primary-dark font-primary text-4xl lowercase text-primary sm:text-5xl lg:py-5">
                {userNickname ? `${userNickname}'s past events` : "Archive"}
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  Loading events...
                </div>
              ) : (
                <Events
                  type="past"
                  take={50}
                  infinite={true}
                  showFilterPanel={!userNickname} // Hide filter panel when viewing a specific user's events
                  preFilterObject={filterObject}
                  useDynamicLayout={true}
                />
              )}
            </div>
          </Main>
        </SharedSpace>
      </CursorsContextProvider>
    </>
  );
};

export default Archive;
