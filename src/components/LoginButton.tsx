"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";

const LoginButton = ({
  className,
  disabled,
}: {
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <SignInButton mode="modal" withSignUp>
      <Button className={className} disabled={disabled}>
        Sign in
      </Button>
    </SignInButton>
  );
};

export default LoginButton;
