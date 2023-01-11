const Button = ({
  handleClick,
  disabled,
  buttonText,
  displayLoading,
  className,
}: {
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  buttonText: string;
  displayLoading?: boolean;
  className?: string;
}) => {
  return (
    <button
      className={`
        ${
          disabled
            ? `
          cursor-not-allowed
          bg-gray-400
          text-gray-600`
            : `
          bg-kernel
          text-gray-200
          hover:shadow-outline
          `
        }
        rounded-lg
        py-2
        px-16
        font-secondary
        text-lg
        uppercase
        transition-shadow
        duration-300
        ease-in-out
        hover:shadow-md
        ${` ` + className}
      `}
      onClick={handleClick}
      disabled={disabled}
    >
      <div className="flex flex-row items-center justify-center gap-4">
        {displayLoading ? (
          <span className="h-2 w-2 animate-ping rounded-full bg-highlight"></span>
        ) : (
          <></>
        )}
        <div>{buttonText}</div>
      </div>
    </button>
  );
};
export default Button;
