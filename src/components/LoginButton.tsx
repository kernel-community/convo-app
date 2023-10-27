import { useDynamicContext } from "@dynamic-labs/sdk-react";
import Button from "./Button";

const LoginButton = () => {
  const { setShowAuthFlow } = useDynamicContext();
  return (
    <Button buttonText="Sign in" handleClick={() => setShowAuthFlow(true)} />
  );
};
export default LoginButton;
