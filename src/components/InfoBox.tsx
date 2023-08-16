import type { ReactNode } from "react";

export const InfoBox = ({
  type,
  children,
}: {
  type: "info" | "warning" | "error";
  children: ReactNode;
}) => {
  let look;
  switch (type) {
    case "error":
      {
        look = "my-3 p-5 rounded-xl bg-warn font-noto";
      }
      break;
    case "info":
      {
        look = "my-3 p-5 rounded-xl bg-highlight font-primary";
      }
      break;
    case "warning":
      {
        look = "my-3 p-5 rounded-xl bg-highlight font-primary";
      }
      break;
  }
  return <div className={look}>{children}</div>;
};
