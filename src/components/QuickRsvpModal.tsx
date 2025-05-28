import { useState } from "react";
import { RSVP_TYPE } from "@prisma/client";
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
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { cn } from "src/utils/cn";

interface QuickRsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  onSuccess: () => void;
}

export function QuickRsvpModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onSuccess,
}: QuickRsvpModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    nickname: string;
    email: string;
    rsvpType: RSVP_TYPE;
  }>({
    nickname: "",
    email: "",
    rsvpType: RSVP_TYPE.GOING,
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.nickname.trim() || !formData.email.trim()) {
        setError("Please fill in all fields");
        return;
      }

      // First, create/upsert the user
      const userResponse = await fetch("/api/create/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: formData.nickname.trim(),
          email: formData.email.trim(),
        }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      const userData = await userResponse.json();

      if (!userData?.id) {
        throw new Error("User ID not found in response");
      }

      // Then create the RSVP
      const rsvpResponse = await fetch("/api/create/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rsvp: {
            userId: userData.id,
            eventId,
            type: formData.rsvpType,
          },
        }),
      });

      if (!rsvpResponse.ok) {
        const errorData = await rsvpResponse.json();
        throw new Error(errorData.error || "Failed to create RSVP");
      }

      // Reset form and close modal
      setFormData({
        nickname: "",
        email: "",
        rsvpType: RSVP_TYPE.GOING,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating RSVP:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRsvpTypeChange = (type: RSVP_TYPE) => {
    setFormData((prev) => ({ ...prev, rsvpType: type }));
  };

  return (
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent className="max-w-md">
        <CredenzaHeader>
          <CredenzaTitle>Quick RSVP</CredenzaTitle>
          <CredenzaDescription>
            RSVP to &quot;{eventTitle}&quot; - no account needed! We&apos;ll
            email you the calendar invite.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname *</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nickname: e.target.value }))
                }
                placeholder="How should we call you?"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-3">
              <Label>RSVP Status</Label>
              <RadioGroup className="flex flex-col gap-3">
                <div
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    formData.rsvpType === RSVP_TYPE.GOING &&
                      "bg-primary/5 border-primary"
                  )}
                  onClick={() => handleRsvpTypeChange(RSVP_TYPE.GOING)}
                >
                  <RadioGroupItem
                    value="going"
                    id="going"
                    checked={formData.rsvpType === RSVP_TYPE.GOING}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="going" className="cursor-pointer font-medium">
                    Going
                  </Label>
                </div>

                <div
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    formData.rsvpType === RSVP_TYPE.MAYBE &&
                      "bg-primary/5 border-primary"
                  )}
                  onClick={() => handleRsvpTypeChange(RSVP_TYPE.MAYBE)}
                >
                  <RadioGroupItem
                    value="maybe"
                    id="maybe"
                    checked={formData.rsvpType === RSVP_TYPE.MAYBE}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="maybe" className="cursor-pointer font-medium">
                    Maybe
                  </Label>
                </div>

                <div
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    formData.rsvpType === RSVP_TYPE.NOT_GOING &&
                      "bg-primary/5 border-primary"
                  )}
                  onClick={() => handleRsvpTypeChange(RSVP_TYPE.NOT_GOING)}
                >
                  <RadioGroupItem
                    value="not-going"
                    id="not-going"
                    checked={formData.rsvpType === RSVP_TYPE.NOT_GOING}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor="not-going"
                    className="cursor-pointer font-medium"
                  >
                    Not Going
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.nickname.trim() ||
              !formData.email.trim()
            }
          >
            {isSubmitting ? "Submitting..." : "Submit RSVP"}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
