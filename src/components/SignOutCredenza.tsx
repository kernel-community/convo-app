"use client";

import { useState } from "react";
import { Button } from "src/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaBody,
} from "src/components/ui/credenza";

type SignOutCredenzaProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
};

export const SignOutCredenza = ({
  open,
  onOpenChange,
  onSignOut,
  isSigningOut,
}: SignOutCredenzaProps) => {
  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Sign out of your account?</CredenzaTitle>
          <CredenzaDescription>
            You&apos;ll need to sign in again to access your profile and other
            authenticated features.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          <p className="text-sm text-muted-foreground">
            Your session will be ended immediately.
          </p>
        </CredenzaBody>
        <CredenzaFooter>
          <Button
            variant="destructive"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="mr-2"
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default SignOutCredenza;
