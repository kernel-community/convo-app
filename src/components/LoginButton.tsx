import Button from "./Button";

const LoginButton = () => {
  const openConnectModal = () => {
    console.log("open connect modal here");
  };
  return (
    <Button handleClick={openConnectModal} buttonText="Sign in With Wallet" />
  );
};
export default LoginButton;
