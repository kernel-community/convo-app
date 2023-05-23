import type { ReactNode } from "react";

const ModalContainer = ({
  onClickConfirm,
  children,
}: {
  onClickConfirm?: () => void;
  children?: ReactNode;
}) => {
  return (
    <div className="flex h-full flex-col justify-between">
      {children}
      {onClickConfirm && (
        <div>
          <button onClick={onClickConfirm}>Confirm</button>
        </div>
      )}
    </div>
  );
};

export default ModalContainer;
