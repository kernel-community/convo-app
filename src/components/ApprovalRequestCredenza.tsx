import { useState } from "react";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "./ui/credenza";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RSVP_TYPE } from "@prisma/client";
import type { User } from "@prisma/client";
import Signature from "./EventPage/Signature";

interface ApprovalRequestCredenzaProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  rsvpType: RSVP_TYPE;
  user: User;
  onSuccess: () => void;
}

export function ApprovalRequestCredenza({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  rsvpType,
  user,
  onSuccess,
}: ApprovalRequestCredenzaProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/approval/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          eventId,
          rsvpType,
          message: message.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit approval request");
      }

      onSuccess();
      onClose();
      setMessage(""); // Reset form
    } catch (error) {
      console.error("Error submitting approval request:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRsvpTypeDisplay = () => {
    switch (rsvpType) {
      case RSVP_TYPE.GOING:
        return "Going";
      case RSVP_TYPE.MAYBE:
        return "Maybe";
      case RSVP_TYPE.NOT_GOING:
        return "Not Going";
      default:
        return rsvpType;
    }
  };

  return (
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Request RSVP Approval</CredenzaTitle>
          <CredenzaDescription>
            This event requires approval for all RSVPs. Please submit your
            request below and the event organizer will review it.
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody>
          <div className="space-y-4">
            {/* Event Info */}
            <div className="rounded-lg bg-muted p-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Event
              </h4>
              <p className="font-medium">{eventTitle}</p>
            </div>

            {/* RSVP Type */}
            <div className="rounded-lg bg-muted p-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Your RSVP
              </h4>
              <p className="font-medium">{getRsvpTypeDisplay()}</p>
            </div>

            {/* User Signature */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Requesting as
              </Label>
              <div className="mt-2">
                <Signature user={user} style="fancy" />
              </div>
            </div>

            {/* Optional Message */}
            <div className="space-y-2">
              <Label htmlFor="approval-message">
                Message to organizer (optional)
              </Label>
              <Textarea
                id="approval-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the organizer why you'd like to attend this event..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This message will be included in your approval request and help
                the organizer make their decision.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </CredenzaBody>

        <CredenzaFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Submitting Request..." : "Submit Request"}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
