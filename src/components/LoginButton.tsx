"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react";
import { Button } from "./ui/button";

const LoginButton = ({
  className,
  disabled,
}: {
  className?: string;
  disabled?: boolean;
}) => {
  const { setShowAuthFlow } = useDynamicContext();
  return (
    <Button
      onClick={() => setShowAuthFlow(true)}
      className={className}
      disabled={disabled}
    >
      Sign in
    </Button>
  );
};
export default LoginButton;
