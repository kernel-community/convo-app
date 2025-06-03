import type { User } from "@prisma/client";
import { UserImage } from "../ui/default-user-image";

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
  className,
}: {
  user: {
    id: string;
    nickname: string | null;
    image?: string | null;
    profiles?: Array<{ image?: string | null }>;
    profile?: { image?: string | null } | null;
  };
  style?: SignatureStyle;
  className?: string;
}) => {
  const sign = user.nickname ?? "User";
  const { font, textSizeDefault, textSizeSmall } = getStyles(style);

  // Get image from profiles array (first one), or fallback to profile or direct image prop
  const userImage =
    user.profiles?.[0]?.image || user.profile?.image || user.image;

  return (
    <div className="flex flex-row items-center gap-2">
      <UserImage userId={user.id} photo={userImage} size="sm" />

      <div
        className={`${font} ${textSizeSmall} md:${textSizeDefault} ${className}`}
      >
        {sign}
      </div>
    </div>
  );
};

export default Signature;
