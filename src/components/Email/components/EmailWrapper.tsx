import Image from "next/image";
import { CoolEmoji, HeartEmoji } from "src/components/ui/emojis";

export const EmailWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mx-auto max-w-[600px] bg-background p-8 font-sans text-foreground">
    {/* Header */}
    <div className="mb-8 flex items-center justify-between">
      <Image
        src="/images/logo.png"
        alt="Convo Logo"
        width={40}
        height={40}
        className="opacity-90"
      />
      <HeartEmoji width={35} height={35} />
    </div>

    {/* Content */}
    <div className="space-y-6">{children}</div>

    {/* Footer */}
    <div className="mt-12 border-t border-muted pt-8 text-sm text-muted-foreground">
      <p className="flex items-center gap-2">
        Hedwig <CoolEmoji width={20} height={20} className="-mx-1" />, at your
        service
      </p>
      <p className="mt-2 text-xs">
        This email was sent by Convo. If you didn&apos;t expect this, please
        ignore.
      </p>
    </div>
  </div>
);
