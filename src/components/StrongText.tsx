import type { ReactNode } from "react";

const FieldLabel = ({
  children,
  styles,
  htmlFor,
}: {
  children: ReactNode;
  styles?: string;
  htmlFor?: string;
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`
      font-secondary
      text-sm
      font-semibold
      uppercase
      text-foreground
      ${styles}
    `}
    >
      {children}
    </label>
  );
};

export default FieldLabel;
