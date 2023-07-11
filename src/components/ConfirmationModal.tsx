import type { ReactElement } from "react";
import ReactModal from "react-modal";

// @todo @angelagilhotra fix styling of the modal

const ConfirmationModal = ({
  isOpen,
  onClose,
  content,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: ReactElement;
  title: string;
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      contentLabel="Confirmation Modal"
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      style={{
        content: {
          opacity: "100%",
          backgroundColor: "white",
          width: "450px",
          height: "350px",
          margin: "auto",
        },
        overlay: {},
      }}
      ariaHideApp={false}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="mb-2 flex flex-row justify-between">
          <div>{title}</div>
          <button onClick={onClose}>close</button>
        </div>
        {content}
      </div>
    </ReactModal>
  );
};

export default ConfirmationModal;
