import { Dispatch, SetStateAction, useState } from "react";
import { AlertCircle, XCircle } from "lucide-react";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "src/components/ui/credenza";
import type { ClientEventInput } from "src/types";
import type { UserStatus } from "src/context/UserContext";
import type { User } from "@prisma/client";
import { Button } from "src/components/ui/button";
import { Article } from "src/components/Article";
import FieldLabel from "../StrongText";
import { getDateTimeString } from "src/utils/dateTime";
import { RRule } from "rrule";
import { Skeleton } from "../ui/skeleton";
import { FancyHighlight } from "src/components/FancyHighlight";
import Signature from "../EventPage/Signature";
import { DateTime } from "luxon";

// Use ProposerInfo type from ProposeForm (assuming it's exported or redefined here)
// If not exported, copy the definition here
type ProposerInfo = {
  id: string;
  nickname: string | null;
  image?: string | null;
  email?: string | null;
};

// Helper function to format timezone with offset
const formatTimezoneDisplay = (timezone: string): string => {
  try {
    const now = DateTime.now().setZone(timezone);
    const offset = now.toFormat("ZZZZ"); // e.g., GMT-04:00
    return `${timezone.replace("_", " ")} (${offset})`;
  } catch (e) {
    return timezone;
  }
};

export const ConfirmConvoCredenza = ({
  openModalFlag,
  setOpenModalFlag,
  convoToCreateData,
  user,
  action,
  isLoading,
  fullProposersList, // Add new prop
  errorMessage, // Add error message prop
}: {
  openModalFlag: boolean;
  setOpenModalFlag: Dispatch<SetStateAction<boolean>>;
  convoToCreateData: ClientEventInput | undefined;
  user: UserStatus;
  action: () => Promise<void>;
  isLoading: boolean;
  fullProposersList?: ProposerInfo[]; // Make it optional for safety
  errorMessage?: string; // Optional error message from form validation or API
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
                      "date",
                      convoToCreateData.creationTimezone
                    )}{" "}
                    {getDateTimeString(
                      convoToCreateData.dateTimeStartAndEnd.start.toISOString(),
                      "time",
                      convoToCreateData.creationTimezone
                    )}
                  </FancyHighlight>
                </div>
              )}
            </div>

            {/* Timezone Information */}
            <FieldLabel>Timezone</FieldLabel>
            <div>
              {convoToCreateData?.creationTimezone ? (
                <FancyHighlight>
                  {formatTimezoneDisplay(convoToCreateData.creationTimezone)}
                </FancyHighlight>
              ) : (
                <span className="text-muted-foreground">
                  {formatTimezoneDisplay(
                    Intl.DateTimeFormat().resolvedOptions().timeZone
                  )}{" "}
                  (local)
                </span>
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
        {/* Error message display */}
        {errorMessage && (
          <div className="mx-4 mb-4 rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Past date warning */}
        {convoToCreateData &&
          new Date(convoToCreateData.dateTimeStartAndEnd.start) <
            new Date() && (
            <div className="mx-4 mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle
                    className="h-5 w-5 text-yellow-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      The event date and time you selected is in the past.
                      Events cannot be scheduled in the past.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        <CredenzaFooter>
          {convoToCreateData && !isLoading && (
            <Button
              onClick={() => action()}
              className="w-full"
              disabled={
                errorMessage !== undefined ||
                (convoToCreateData &&
                  new Date(convoToCreateData.dateTimeStartAndEnd.start) <
                    new Date())
              }
            >
              Submit
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
