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
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";

interface AddRsvpCredenzaProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess: () => void;
}

export function AddRsvpCredenza({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}: AddRsvpCredenzaProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    rsvpType: "GOING",
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // First, upsert the user
      const userResponse = await fetch("/api/create/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: formData.nickname || undefined, // Only send if provided
          email: formData.email,
        }),
      });

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.error || "Failed to create user");
      }

      // Get the created user's ID from the response
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
        throw new Error("Failed to create RSVP");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating RSVP:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Add RSVP</CredenzaTitle>
          <CredenzaDescription>
            An invite will be sent to the email provided here. They will receive
            the email as if they have RSVP&apos;d
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nickname: e.target.value }))
                }
                placeholder="Enter nickname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label>RSVP Status</Label>
              <Select
                value={formData.rsvpType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, rsvpType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOING">Going</SelectItem>
                  <SelectItem value="NOT_GOING">Not Going</SelectItem>
                  <SelectItem value="MAYBE">Maybe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.nickname || !formData.email}
          >
            {isSubmitting ? "Adding..." : "Add RSVP"}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
