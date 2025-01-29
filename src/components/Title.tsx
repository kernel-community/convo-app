export const Title = ({
  text,
  className,
  highlight,
}: {
  text?: string;
  className?: string;
  highlight?: string;
}) => {
  return (
    <div
      className={
        `
      mx-auto font-secondary text-xl text-primary dark:text-primary-dark sm:text-4xl` +
        ` ${className}`
      }
    >
      {text && text}
      {text && highlight && " "}
      {highlight && <span className="text-kernel-light">{highlight}</span>}
    </div>
  );
};
