import { Check, ClipboardCopy } from "lucide-react";
import { useEffect, useState } from "react";

const CopyButton = ({
  text,
  label,
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) => {
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
    <div
      className={`flex cursor-pointer flex-row items-center gap-3 ${
        label ? "rounded-md bg-slate-200 p-2 " : ""
      } ${className}`}
      onClick={copyText}
    >
      {label}
      {isCopied ? (
        <Check className="w-[20px]" />
      ) : (
        <ClipboardCopy className="w-[20px]" />
      )}
    </div>
  );
};

export default CopyButton;
