"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react";
import { Button } from "./ui/button";

const LoginButton = ({ className }: { className?: string }) => {
  const { setShowAuthFlow } = useDynamicContext();
  return (
    <Button onClick={() => setShowAuthFlow(true)} className={className}>
      Sign in
    </Button>
  );
};
export default LoginButton;
