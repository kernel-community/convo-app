import type { Dispatch, SetStateAction } from "react";
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

export const ConfirmConvoCredenza = ({
  openModalFlag,
  setOpenModalFlag,
  convoToCreateData,
  user,
  action,
  isLoading,
  isEditing,
}: {
  openModalFlag: boolean;
  setOpenModalFlag: Dispatch<SetStateAction<boolean>>;
  convoToCreateData: ClientEventInput | undefined;
  user: UserStatus;
  action: () => Promise<void>;
  isLoading: boolean;
  isEditing: boolean;
}) => {
  return (
    <Credenza open={openModalFlag} onOpenChange={setOpenModalFlag}>
      <CredenzaContent className="flex h-[34rem] flex-col">
        <CredenzaHeader>
          {isEditing ? (
            <CredenzaTitle>Confirm Edits to Convo</CredenzaTitle>
          ) : (
            <CredenzaTitle>Confirm Convo</CredenzaTitle>
          )}
          {isEditing ? (
            <CredenzaDescription>
              You are editing the Convo. Confirm all details below before
              clicking submit.
            </CredenzaDescription>
          ) : (
            <CredenzaDescription>
              You are proposing a Convo for Kernel. Confirm all details below
              before clicking submit.
            </CredenzaDescription>
          )}
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
            <FieldLabel>Limit</FieldLabel>
            <div>{convoToCreateData?.limit}</div>
            <FieldLabel>Location</FieldLabel>
            <div>{convoToCreateData?.location}</div>
            <FieldLabel>Signed by</FieldLabel>
            <Signature user={user as User} />
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
