import type { ReactNode } from "react";

const FieldLabel = ({
  children,
  styles,
}: {
  children: ReactNode;
  styles?: string;
}) => {
  return (
    <div
      className={`
      font-secondary
      text-sm
      uppercase
      text-gray-800
      ${styles}
    `}
    >
      {children}
    </div>
  );
};

export default FieldLabel;
