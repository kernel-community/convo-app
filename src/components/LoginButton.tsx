"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react";
import { Button } from "./ui/button";

const LoginButton = () => {
  const { setShowAuthFlow } = useDynamicContext();
  return <Button onClick={() => setShowAuthFlow(true)}>Sign in</Button>;
};
export default LoginButton;
