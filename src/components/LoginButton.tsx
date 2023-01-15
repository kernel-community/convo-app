import { ConnectButton } from "@rainbow-me/rainbowkit";

const LoginButton = () => {
  return (
    <ConnectButton
      accountStatus="avatar"
      chainStatus="none"
      showBalance={false}
      label="sign in"
    />
  );
};
export default LoginButton;
