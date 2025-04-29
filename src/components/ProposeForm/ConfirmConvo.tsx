import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { getDateTimeString } from "src/utils/dateTime";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "src/components/ui/credenza";
import FieldLabel from "src/components/StrongText";
import { Button } from "src/components/ui/button";
import Signature from "src/components/EventPage/Signature";
import { Article } from "src/components/Article";
import type { User } from "@prisma/client";
import type { UserStatus } from "src/context/UserContext";
import { Skeleton } from "src/components/ui/skeleton";
import type { ClientEventInput } from "src/types";
import { RRule } from "rrule";
import { FancyHighlight } from "src/components/FancyHighlight";

// Use ProposerInfo type from ProposeForm (assuming it's exported or redefined here)
// If not exported, copy the definition here
type ProposerInfo = {
  id: string;
  nickname: string | null;
  image?: string | null;
  email?: string | null;
};

export const ConfirmConvoCredenza = ({
  openModalFlag,
  setOpenModalFlag,
  convoToCreateData,
  user,
  action,
  isLoading,
  fullProposersList, // Add new prop
}: {
  openModalFlag: boolean;
  setOpenModalFlag: Dispatch<SetStateAction<boolean>>;
  convoToCreateData: ClientEventInput | undefined;
  user: UserStatus;
  action: () => Promise<void>;
  isLoading: boolean;
  fullProposersList?: ProposerInfo[]; // Make it optional for safety
}) => {
  // State to control showing all hosts
  const [showAllHosts, setShowAllHosts] = useState(false);

  // Determine the list to display
  const displayLimit = 3;
  const hostsToShow =
    fullProposersList && fullProposersList.length > 0
      ? showAllHosts
        ? fullProposersList
        : fullProposersList.slice(0, displayLimit)
      : []; // Start with empty if no list provided

  const totalHosts = fullProposersList?.length ?? 0;
  const hasMoreHosts = totalHosts > displayLimit;
  const remainingHosts = totalHosts - displayLimit;

  return (
    <Credenza open={openModalFlag} onOpenChange={setOpenModalFlag}>
      <CredenzaContent className="flex h-[34rem] flex-col">
        <CredenzaHeader>
          <CredenzaTitle>Confirm Convo</CredenzaTitle>
          <CredenzaDescription>
            Confirm all details below before clicking submit.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody className="flex-1 overflow-y-auto">
          <div className="grid w-full grid-cols-[40%_60%] gap-y-4">
            <FieldLabel>Title</FieldLabel>
            <div>{convoToCreateData?.title}</div>
            <FieldLabel>Description</FieldLabel>
            <div>
              <Article html={convoToCreateData?.description} card />
            </div>
            <FieldLabel>Sessions</FieldLabel>
            <div className="flex flex-col gap-2">
              {convoToCreateData && (
                <div>
                  <FancyHighlight>
                    {getDateTimeString(
                      convoToCreateData.dateTimeStartAndEnd.start.toISOString(),
                      "date"
                    )}{" "}
                    {getDateTimeString(
                      convoToCreateData.dateTimeStartAndEnd.start.toISOString(),
                      "time"
                    )}
                  </FancyHighlight>
                </div>
              )}
            </div>
            {convoToCreateData?.recurrenceRule && (
              <>
                <FieldLabel>Recurrence</FieldLabel>
                <div>
                  <FancyHighlight>
                    {RRule.fromString(
                      convoToCreateData.recurrenceRule
                    ).toText()}
                  </FancyHighlight>
                </div>
              </>
            )}
            {convoToCreateData?.limit !== "0" && (
              <>
                <FieldLabel>Limit</FieldLabel>
                <div>{convoToCreateData?.limit}</div>
              </>
            )}
            <FieldLabel>Location</FieldLabel>
            <div>{convoToCreateData?.location}</div>
            <FieldLabel>Host(s)</FieldLabel>
            <div className="flex flex-col gap-2">
              {hostsToShow.length > 0 ? (
                hostsToShow.map((proposer) => (
                  <Signature key={proposer.id} user={proposer as User} />
                ))
              ) : (
                // Fallback if list is empty or user is not signed in initially
                <Signature user={user as User} />
              )}

              {/* Show More/Less Links */}
              {hasMoreHosts && !showAllHosts && (
                <button
                  type="button"
                  onClick={() => setShowAllHosts(true)}
                  className="cursor-pointer text-left text-sm text-primary hover:underline"
                >
                  + {remainingHosts} more
                </button>
              )}
              {hasMoreHosts && showAllHosts && (
                <button
                  type="button"
                  onClick={() => setShowAllHosts(false)}
                  className="cursor-pointer text-left text-sm text-primary hover:underline"
                >
                  show less
                </button>
              )}
            </div>
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          {convoToCreateData && !isLoading && (
            <Button onClick={() => action()} className="w-full">
              {" "}
              Submit{" "}
            </Button>
          )}
          {isLoading && (
            <Skeleton className="h-[40px] w-full rounded-lg bg-slate-400" />
          )}
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};
