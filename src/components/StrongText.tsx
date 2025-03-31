import type { ReactNode } from "react";

const FieldLabel = ({
  children,
  styles,
  htmlFor,
  required = false,
}: {
  children: ReactNode;
  styles?: string;
  htmlFor?: string;
  required?: boolean;
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
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
};

export default FieldLabel;
