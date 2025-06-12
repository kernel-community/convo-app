"use client";
import Hero from "../Hero";
import type { ClientEvent } from "src/types";
import EventDetails from "./EventDetails";
import { useRouter } from "next/navigation";
import { useUser } from "src/context/UserContext";
import { useEffect, useState } from "react";
import CursorsContextProvider from "src/context/CursorsContext";
import SharedSpace from "src/components/SharedSpace";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "src/components/ui/credenza";
import { Button } from "../ui/button";
import useUpdateRsvp from "src/hooks/useUpdateRsvp";
import { RSVP_TYPE } from "@prisma/client";
import useEvent from "src/hooks/useEvent";
import { Loader2 } from "lucide-react";
import { ApprovalRequestCredenza } from "../ApprovalRequestCredenza";
import type { User } from "@prisma/client";

const EventWrapper = ({
  event,
  isEditable,
  eventHash,
}: {
  event: ClientEvent;
  isEditable: boolean;
  eventHash: string;
}) => {
  const host = process.env.NEXT_PUBLIC_PARTYKIT_SERVER_HOST || "";
  const {
    id: eventId,
    descriptionHtml,
    title,
    proposers,
    isDeleted,
    isImported,
  } = event;

  const router = useRouter();
  const { fetchedUser } = useUser();
  const navigateToEditPage = () => router.push(`/edit/${event.hash}`);
  const [isNavigating, setIsNavigating] = useState(false);

  const [isConfirmCredenzaOpen, setIsConfirmCredenzaOpen] = useState(false);
  const [isApprovalRequestOpen, setIsApprovalRequestOpen] = useState(false);
  const [pendingRsvpType, setPendingRsvpType] = useState<RSVP_TYPE | null>(
    null
  );

  const {
    updateRsvp,
    isLoading: isRsvpUpdating,
    error: rsvpError,
  } = useUpdateRsvp();

  const handleRsvpAttempt = (type: RSVP_TYPE) => {
    console.log("Attempting RSVP with type:", type);
    setPendingRsvpType(type);

    // Check if event requires approval and user doesn't already have an RSVP
    if (
      event.requiresApproval &&
      !event.uniqueRsvps.some((rsvp) => rsvp.attendee.id === fetchedUser.id)
    ) {
      // Show approval request modal
      setIsApprovalRequestOpen(true);
    } else {
      // Show regular confirmation modal
      setIsConfirmCredenzaOpen(true);
    }
  };

  const confirmRsvp = () => {
    if (!pendingRsvpType || !eventId) return;
    console.log("Confirming RSVP:", { eventId, type: pendingRsvpType });

    updateRsvp(
      { eventId: eventId, type: pendingRsvpType },
      {
        onSuccess: (data) => {
          console.log("RSVP Update successful in component:", data);

          // Handle approval required response
          if (data.status === "APPROVAL_REQUIRED") {
            console.log("Approval required, opening approval request modal");
            setIsConfirmCredenzaOpen(false);
            setIsApprovalRequestOpen(true);
            return;
          }

          // Handle normal success
          setIsConfirmCredenzaOpen(false);
          setPendingRsvpType(null);
        },
        onError: (error) => {
          console.error("RSVP Update failed in component:", error);
        },
      }
    );
  };

  const handleApprovalRequestSuccess = () => {
    // Close modal and reset state
    setIsApprovalRequestOpen(false);
    setPendingRsvpType(null);

    // Optionally show a success message or refresh event data
    // Could trigger a toast notification here
    console.log("Approval request submitted successfully");

    // Refresh the event data to show updated approval request status
    window.location.reload();
  };

  const handleInfoClick = async () => {
    try {
      setIsNavigating(true);
      await router.push(`/rsvp/${eventHash}?info=true`);
    } catch (error) {
      console.error("Navigation failed:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  useEffect(() => {
    router.prefetch(`/rsvp/${eventHash}?info=true`);
  }, [eventHash, router]);

  const getCredenzaTexts = (): {
    title: string;
    description: string;
    confirmText: string;
  } => {
    switch (pendingRsvpType) {
      case RSVP_TYPE.GOING:
        return {
          title: "Confirm RSVP?",
          description: `Are you sure you want to RSVP as Going to "${title}"? `,
          confirmText: "Confirm Going",
        };
      case RSVP_TYPE.MAYBE:
        return {
          title: "Update RSVP?",
          description: `Are you sure you want to update your RSVP to Maybe for "${title}"?`,
          confirmText: "Confirm Maybe",
        };
      case RSVP_TYPE.NOT_GOING:
        return {
          title: "Update RSVP?",
          description: `Are you sure you want to update your RSVP to Not Going for "${title}"? This will remove you from the event and waitlist if applicable.`,
          confirmText: "Confirm Not Going",
        };
      default:
        return {
          title: "Confirm Action",
          description: "Please confirm your action.",
          confirmText: "Confirm",
        };
    }
  };

  const {
    title: credenzaTitle,
    description: credenzaDescription,
    confirmText: credenzaConfirmText,
  } = getCredenzaTexts();

  return (
    <CursorsContextProvider host={host} roomId={eventHash}>
      <SharedSpace>
        <>
          <Hero
            isImported={isImported}
            isDeleted={isDeleted}
            event={event}
            onRsvpAttempt={handleRsvpAttempt}
            isRsvpUpdating={isRsvpUpdating}
          />
          <EventDetails html={descriptionHtml} proposers={proposers} />

          <Credenza
            open={isConfirmCredenzaOpen}
            onOpenChange={setIsConfirmCredenzaOpen}
          >
            <CredenzaContent>
              <CredenzaHeader>
                <CredenzaTitle>{credenzaTitle}</CredenzaTitle>
                <CredenzaDescription>{credenzaDescription}</CredenzaDescription>
              </CredenzaHeader>
              {rsvpError && (
                <CredenzaBody>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Error: {rsvpError.message}
                  </p>
                </CredenzaBody>
              )}
              <CredenzaFooter>
                <CredenzaClose asChild>
                  <Button variant="outline" disabled={isRsvpUpdating}>
                    Cancel
                  </Button>
                </CredenzaClose>
                <Button onClick={confirmRsvp} disabled={isRsvpUpdating}>
                  {isRsvpUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {credenzaConfirmText}
                </Button>
              </CredenzaFooter>
            </CredenzaContent>
          </Credenza>

          {/* Approval Request Modal */}
          {fetchedUser.isSignedIn && pendingRsvpType && (
            <ApprovalRequestCredenza
              isOpen={isApprovalRequestOpen}
              onClose={() => {
                setIsApprovalRequestOpen(false);
                setPendingRsvpType(null);
              }}
              eventId={eventId}
              eventTitle={title}
              rsvpType={pendingRsvpType}
              user={fetchedUser as User}
              onSuccess={handleApprovalRequestSuccess}
            />
          )}
        </>
      </SharedSpace>
    </CursorsContextProvider>
  );
};

const EventWrapperWrapper = ({ eventHash }: { eventHash: string }) => {
  const { fetchedUser: user } = useUser();
  const {
    isLoading,
    isError,
    data: fetchedEventData,
  } = useEvent({ hash: eventHash });

  if (isLoading || !user) {
    return (
      <div className="animate-pulse">
        <div className="flex flex-row items-center">
          <div className="h-32 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <h2 className="text-2xl font-bold">Failed to load event</h2>
        <p>Please try refreshing the page</p>
      </div>
    );
  }

  if (!fetchedEventData) {
    return null;
  }

  const isEditable = fetchedEventData.proposers.some(
    (p) => p.userId === user.id
  );

  return (
    <EventWrapper
      event={fetchedEventData}
      isEditable={isEditable}
      eventHash={eventHash}
    />
  );
};

export default EventWrapperWrapper;
