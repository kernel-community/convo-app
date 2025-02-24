import { cn } from "src/lib/utils";
import type { ComponentType } from "react";
import {
  CoolEmoji,
  HeartEyesEmoji,
  HeartEmoji,
  StarryEyesEmoji,
  TongueStickingOutEmoji,
  WinkEmoji,
} from "./emojis";

interface EmojiProps {
  width?: number;
  height?: number;
  className?: string;
}

interface DefaultUserImageProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  userId?: string;
}

const sizeClasses = {
  sm: {
    container: "h-8 w-8",
    emoji: 16,
  },
  md: {
    container: "h-10 w-10",
    emoji: 20,
  },
  lg: {
    container: "h-12 w-12",
    emoji: 24,
  },
};

const EmojiComponents: ComponentType<EmojiProps>[] = [
  CoolEmoji,
  HeartEyesEmoji,
  HeartEmoji,
  StarryEyesEmoji,
  TongueStickingOutEmoji,
  WinkEmoji,
];

// Simple hash function to get a number from a string
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export const DefaultUserImage = ({
  size = "md",
  className,
  userId = "default",
}: DefaultUserImageProps) => {
  // Use userId to deterministically select an emoji
  const index = hashString(userId) % EmojiComponents.length;
  const EmojiComponent = EmojiComponents[index] as ComponentType<EmojiProps>;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-white bg-accent dark:border-gray-800",
        sizeClasses[size].container,
        className
      )}
    >
      <EmojiComponent
        width={sizeClasses[size].emoji}
        height={sizeClasses[size].emoji}
        className="text-accent-foreground"
      />
    </div>
  );
};

export const UserImage = ({
  photo,
  size = "md",
  className,
  userId,
}: {
  photo?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  userId: string;
}) => {
  if (!photo) {
    return (
      <DefaultUserImage size={size} className={className} userId={userId} />
    );
  }

  const containerClass = cn(
    "rounded-full border-2 border-white dark:border-gray-800",
    sizeClasses[size].container,
    className
  );

  // eslint-disable-next-line @next/next/no-img-element
  return <img className={containerClass} src={photo} alt="" />;
};
