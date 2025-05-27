import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Card, CardContent } from "./ui/card";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import Signature from "./EventPage/Signature";
import type { RsvpApprovalRequestWithDetails } from "src/types";
import { RSVP_APPROVAL_STATUS, RSVP_TYPE } from "@prisma/client";
import type { User as PrismaUser } from "@prisma/client";

interface ApprovalManagementAccordionProps {
  eventId: string;
  currentUser: PrismaUser;
}

export function ApprovalManagementAccordion({
  eventId,
  currentUser,
}: ApprovalManagementAccordionProps) {
  const [approvalRequests, setApprovalRequests] = useState<
    RsvpApprovalRequestWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null
  );
  const [reviewMessages, setReviewMessages] = useState<{
    [key: string]: string;
  }>({});

  // Fetch approval requests
  useEffect(() => {
    const fetchApprovalRequests = async () => {
      try {
        const response = await fetch(
          "/api/approval/rsvp?" +
            new URLSearchParams({
              eventId,
              status: "PENDING",
            })
        );

        if (response.ok) {
          const data = await response.json();
          setApprovalRequests(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching approval requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalRequests();
  }, [eventId]);

  const handleApprovalAction = async (
    requestId: string,
    action: "APPROVED" | "REJECTED"
  ) => {
    try {
      setProcessingRequest(requestId);

      const response = await fetch("/api/approval/rsvp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          status: action,
          reviewedBy: currentUser.id,
          reviewMessage: reviewMessages[requestId]?.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process request");
      }

      // Remove the processed request from the list
      setApprovalRequests((prev) => prev.filter((req) => req.id !== requestId));

      // Clear the review message
      setReviewMessages((prev) => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });
    } catch (error) {
      console.error("Error processing approval:", error);
      alert("Failed to process approval request. Please try again.");
    } finally {
      setProcessingRequest(null);
    }
  };

  const updateReviewMessage = (requestId: string, message: string) => {
    setReviewMessages((prev) => ({
      ...prev,
      [requestId]: message,
    }));
  };

  const getRsvpTypeDisplay = (rsvpType: RSVP_TYPE) => {
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

  if (loading) {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="approval-requests">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Loading approval requests...
            </div>
          </AccordionTrigger>
        </AccordionItem>
      </Accordion>
    );
  }

  const pendingCount = approvalRequests.length;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="approval-requests">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>RSVP Approval Requests</span>
            {pendingCount > 0 && (
              <Badge variant="secondary">{pendingCount} pending</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {pendingCount === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending approval requests.
              </p>
            ) : (
              approvalRequests.map((request) => (
                <Card
                  key={request.id}
                  className="border-l-4 border-l-yellow-500"
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* User Info and RSVP Type */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <Signature user={request.user} style="fancy" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Wants to RSVP as:
                            </span>
                            <Badge variant="outline">
                              {getRsvpTypeDisplay(request.rsvpType)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* User's Message */}
                      {request.message && (
                        <div className="rounded-lg bg-muted p-3">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Message from attendee:
                          </Label>
                          <p className="mt-1 text-sm">
                            &quot;{request.message}&quot;
                          </p>
                        </div>
                      )}

                      {/* Review Message Input */}
                      <div className="space-y-2">
                        <Label
                          htmlFor={`review-${request.id}`}
                          className="text-sm"
                        >
                          Your response (optional)
                        </Label>
                        <Textarea
                          id={`review-${request.id}`}
                          value={reviewMessages[request.id] || ""}
                          onChange={(e) =>
                            updateReviewMessage(request.id, e.target.value)
                          }
                          placeholder="Add a message to include in your response..."
                          rows={2}
                          className="resize-none"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleApprovalAction(request.id, "APPROVED")
                          }
                          disabled={processingRequest === request.id}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {processingRequest === request.id
                            ? "Approving..."
                            : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleApprovalAction(request.id, "REJECTED")
                          }
                          disabled={processingRequest === request.id}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          {processingRequest === request.id
                            ? "Rejecting..."
                            : "Reject"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
