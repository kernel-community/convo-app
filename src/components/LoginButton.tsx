import { useDynamicContext } from "@dynamic-labs/sdk-react";
import Button from "./Button";

const LoginButton = () => {
  const { setShowAuthFlow } = useDynamicContext();
  return (
    <Button
      buttonText="Sign in With Wallet"
      handleClick={() => setShowAuthFlow(true)}
    />
  );
};
export default LoginButton;
