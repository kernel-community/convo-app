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
      font-semibold
      uppercase
      text-gray-800 dark:text-[#DCDCDC]
      ${styles}
    `}
    >
      {children}
    </div>
  );
};

export default FieldLabel;
