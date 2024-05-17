import { Check, ClipboardCopy } from "lucide-react";
import { useEffect, useState } from "react";

const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const copyText = () => {
    setIsCopied((c) => !c);
    navigator.clipboard.writeText(text);
  };
  useEffect(() => {
    if (isCopied) {
      const tmr = setTimeout(() => setIsCopied(false), 1 * 1000);
      return () => {
        clearTimeout(tmr);
      };
    }
  }, [isCopied]);
  return (
    <div>
      {isCopied ? (
        <Check className="w-[20px]" />
      ) : (
        <ClipboardCopy onClick={copyText} className="w-[20px] cursor-pointer" />
      )}
    </div>
  );
};

export default CopyButton;
