import type { User } from "@prisma/client";

type SignatureStyle = "fancy" | "handwritten";

const getStyles = (
  style: SignatureStyle
): { textSizeDefault: string; textSizeSmall: string; font: string } => {
  let textSizeDefault = "text-4xl";
  let textSizeSmall = "text-2xl";
  let font = "font-fancy";
  switch (style) {
    case "fancy":
      {
        textSizeDefault = "text-5xl";
        textSizeSmall = "text-4xl";
        font = "font-fancy";
      }
      break;
    case "handwritten":
      {
        textSizeDefault = "text-2xl";
        textSizeSmall = "text-3xl";
        font = "font-handwritten";
      }
      break;
    default: {
      /** do nothing */
    }
  }
  return {
    textSizeDefault,
    textSizeSmall,
    font,
  };
};

const Signature = ({
  user,
  style = "fancy",
}: {
  user: User;
  style?: SignatureStyle;
}) => {
  const sign = user.nickname;
  // signature displayed is of the currently signed in user
  const { font, textSizeDefault, textSizeSmall } = getStyles(style);

  return (
    <div className="flex flex-row items-center gap-3">
      <div
        className={`${font} ${textSizeSmall} text-kernel dark:text-kernel-light md:${textSizeDefault}`}
      >
        {sign}
      </div>
    </div>
  );
};

export default Signature;
