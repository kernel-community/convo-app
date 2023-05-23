const Signature = ({
  sign,
  style = "fancy",
}: {
  sign: string | null;
  style?: "fancy" | "handwritten";
}) => {
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
  return (
    <div
      className={`${font} ${textSizeSmall} text-kernel md:${textSizeDefault}`}
    >
      {sign}
    </div>
  );
};

export default Signature;
