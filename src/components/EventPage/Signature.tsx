import type { User } from "@prisma/client";
import { useUser } from "src/context/UserContext";

const Signature = ({
  user,
  style = "fancy",
}: {
  user: User;
  style?: "fancy" | "handwritten";
}) => {
  let textSizeDefault = "text-4xl";
  let textSizeSmall = "text-2xl";
  let font = "font-fancy";
  const sign = user.nickname;

  const { fetchedUser } = useUser();
  const displayEditButton = fetchedUser.address === user.address;

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
  return (
    <div>
      <div
        className={`${font} ${textSizeSmall} text-kernel md:${textSizeDefault}`}
      >
        {sign}
      </div>
      {displayEditButton && <div>EDIT</div>}
    </div>
  );
};

export default Signature;
