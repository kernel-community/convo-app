import ReactModal from "react-modal";

const ConfirmationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
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
          width: "420px",
          height: "320px",
          margin: "auto",
        },
        overlay: {
          color: "red",
        },
      }}
    >
      {/* Todo @angelagilhotra */}
      <p>Hello</p>
    </ReactModal>
  );
};

export default ConfirmationModal;
