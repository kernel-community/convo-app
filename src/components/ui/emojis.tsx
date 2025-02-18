import Image from "next/image";

interface EmojiProps {
  width?: number;
  height?: number;
  className?: string;
}

export function CoolEmoji({ width = 16, height = 16, className }: EmojiProps) {
  return (
    <Image
      src="/images/emojis/cool.png"
      alt="cool emoji"
      width={width}
      height={height}
      className={className}
    />
  );
}

export function HeartEyesEmoji({
  width = 16,
  height = 16,
  className,
}: EmojiProps) {
  return (
    <Image
      src="/images/emojis/heart-eyes.png"
      alt="heart eyes emoji"
      width={width}
      height={height}
      className={className}
    />
  );
}

export function HeartEmoji({ width = 16, height = 16, className }: EmojiProps) {
  return (
    <Image
      src="/images/emojis/heart.png"
      alt="heart emoji"
      width={width}
      height={height}
      className={className}
    />
  );
}

export function StarryEyesEmoji({
  width = 16,
  height = 16,
  className,
}: EmojiProps) {
  return (
    <Image
      src="/images/emojis/starry-eyes.png"
      alt="starry eyes emoji"
      width={width}
      height={height}
      className={className}
    />
  );
}

export function TongueStickingOutEmoji({
  width = 16,
  height = 16,
  className,
}: EmojiProps) {
  return (
    <Image
      src="/images/emojis/tongue-sticking-out.png"
      alt="tongue sticking out emoji"
      width={width}
      height={height}
      className={className}
    />
  );
}

export function WinkEmoji({ width = 16, height = 16, className }: EmojiProps) {
  return (
    <Image
      src="/images/emojis/wink.png"
      alt="wink emoji"
      width={width}
      height={height}
      className={className}
    />
  );
}
