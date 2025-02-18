import { CoolEmoji, HeartEmoji } from "./EmailEmojis";
import { STAGING, DEFAULT_HOST } from "src/utils/constants";

// Using absolute URL for email clients
const BASE_URL = process.env.NODE_ENV === "production" ? DEFAULT_HOST : STAGING;
const LOGO_URL = `https://${BASE_URL}/images/logo.png`;

export const EmailWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mx-auto max-w-[600px] bg-background p-8 font-sans text-foreground">
    {/* Header */}
    <div className="mb-8 flex items-center justify-between">
      <img
        src={LOGO_URL}
        alt="Convo Logo"
        width={40}
        height={40}
        className="opacity-90"
        style={{ width: "40px", height: "40px" }} // Explicit size for email clients
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
