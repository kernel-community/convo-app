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
      dark:text-primary-dark mx-auto font-primary text-xl text-primary sm:text-4xl` +
        ` ${className}`
      }
    >
      {text && text}
      {text && highlight && " "}
      {highlight && <span className="text-highlight-active">{highlight}</span>}
    </div>
  );
};
