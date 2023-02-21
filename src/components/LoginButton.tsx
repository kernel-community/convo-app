import { useConnectModal } from "@rainbow-me/rainbowkit";
import Button from "./Button";

const LoginButton = () => {
  const { openConnectModal } = useConnectModal();
  return (
    <Button handleClick={openConnectModal} buttonText="Sign in With Wallet" />
  );
};
export default LoginButton;
