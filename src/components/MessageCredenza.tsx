import { Button } from "src/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "src/components/ui/credenza";
import { ScrollArea } from "src/components/ui/scroll-area";
import { ArrowUpRight, CheckCircle } from "lucide-react";
import type { ServerEvent } from "src/types";
import { useState } from "react";

interface MessageCredenzaProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: ServerEvent["rsvps"];
  message: string;
  onSend: () => Promise<void>;
  isLoading?: boolean;
}

export function MessageCredenza({
  isOpen,
  onClose,
  recipients,
  message,
  onSend,
  isLoading = false,
}: MessageCredenzaProps) {
  const [isSent, setIsSent] = useState(false);

  const handleSend = async () => {
    try {
      await onSend();
      setIsSent(true);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  return (
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>
            {isSent ? "Message Sent" : "Confirm Message"}
          </CredenzaTitle>
          <CredenzaDescription>
            {isSent
              ? "Your message has been sent successfully"
              : "Review the message and recipients before sending"}
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="space-y-4 p-4">
          {isSent ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
              <p className="text-lg font-medium">Sent email to recipients.</p>
              <p className="text-sm text-muted-foreground">
                A copy of the email has been sent to you as well.
              </p>
            </div>
          ) : (
            <>
              <div>
                <h4 className="mb-2 text-sm font-medium">Message</h4>
                <ScrollArea className="bg-muted/30 h-32 rounded-lg border border-primary p-3">
                  <p className="whitespace-pre-wrap text-sm">{message}</p>
                </ScrollArea>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">
                  Recipients ({recipients.length})
                </h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {recipients.map((rsvp, index) => (
                      <div
                        key={index}
                        className="bg-muted/30 flex items-center justify-between rounded-lg border border-border p-2 text-sm"
                      >
                        <span>{rsvp.attendee.nickname}</span>
                        <span className="text-xs text-muted-foreground">
                          {rsvp.attendee.email}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
        <CredenzaFooter>
          <Button variant="outline" onClick={onClose}>
            {isSent ? "Close" : "Cancel"}
          </Button>
          {!isSent && (
            <Button onClick={handleSend} className="gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
