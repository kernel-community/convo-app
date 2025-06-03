// import isNicknameSet from "src/utils/isNicknameSet"; // No longer needed for single check
import { Article } from "../Article";
import Signature from "./Signature"; // RE-IMPORTED
import type { ClientEvent } from "src/types";
import React from "react";
import { Button } from "src/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "src/components/ui/dialog";
import { UserImage } from "src/components/ui/default-user-image";
import { Pencil, Check, X, Copy } from "lucide-react";
import { Badge } from "src/components/ui/badge";
import { useUser } from "src/context/UserContext";
import { getUserImage } from "src/utils/getUserProfile";

// Helper function to format names
/*
const formatNames = (names: string[]): string => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0] ?? ""} & ${names[1] ?? ""}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1] ?? ""}`;
};
*/

const EventDetails = ({
  html,
  // proposer, // REMOVED
  proposers, // ADDED
}: {
  html: string | null;
  // proposer: ClientEvent["proposer"]; // REMOVED
  proposers: ClientEvent["proposers"]; // ADDED
}) => {
  // Explicitly type 'p' to guide the linter
  // const proposerNicknames = proposers?.map((p: { userId: string; nickname: string }) => p.nickname) ?? [];
  // const formattedProposerNames = formatNames(proposerNicknames);

  const proposeWithProposers = proposers.flatMap((p) => ({
    id: p.userId,
    nickname: p.user.nickname,
    image: getUserImage(p.user),
  }));

  return (
    <>
      <div className="font-primary text-lg font-light">Convo Description</div>
      <hr className="border-1 my-4 rounded-lg border-muted" />
      <Article html={html} />
      <hr className="border-1 my-4 rounded-lg border-muted" />
      {/* Replace single proposer display with multi-proposer display */}
      {/* {isNicknameSet(proposer.nickname) && <Signature user={proposer} />} REMOVED OLD LINE */}

      {/* START: Added section for multiple proposers */}
      {proposers && proposers.length > 0 && (
        <div className="mt-4">
          <div className="mb-1 font-secondary text-sm font-semibold text-muted-foreground">
            Proposed by:
          </div>
          {/* Render each Signature component directly */}
          <div className="flex flex-row flex-wrap items-center gap-x-1.5">
            {proposers.map((p, index) => (
              <React.Fragment key={p.user.id}>
                <Signature
                  user={{
                    id: p.user.id,
                    nickname: p.user.nickname,
                    image: getUserImage(p.user),
                    profiles: p.user.profiles,
                    profile: p.user.profile,
                  }}
                  style="fancy"
                  className="text-4xl"
                />
                {/* Add comma separator if not the last or second-to-last item */}
                {index < proposers.length - 2 && (
                  <span className="mr-1.5 font-fancy text-3xl">,</span>
                )}
                {/* Add ampersand separator if it is the second-to-last item */}
                {index === proposers.length - 2 && (
                  <span className="mx-1.5 font-fancy text-3xl">&</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      {/* END: Added section */}
    </>
  );
};

export default EventDetails;
