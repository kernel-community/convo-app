import Button from "../Button";

const SubmitRsvpSection = ({
  text,
  handleSubmit,
  loading,
  disabled,
}: {
  text?: string;
  handleSubmit: React.MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
  disabled?: boolean;
}) => {
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-2">
        <span className="font-primary text-sm font-light lowercase italic">
          {text}
        </span>
        <Button
          handleClick={handleSubmit}
          disabled={disabled}
          displayLoading={loading}
          buttonText={`RSVP`}
          className="mt-3 w-full"
        />
      </div>
    </div>
  );
};

export default SubmitRsvpSection;
