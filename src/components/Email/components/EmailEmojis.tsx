import { DEFAULT_HOST } from "src/utils/constants";
import { Hourglass } from "lucide-react";

interface EmojiProps {
  width?: number;
  height?: number;
  className?: string;
}

// Using absolute URL for email clients
// const BASE_URL = process.env.NODE_ENV === "production" ? DEFAULT_HOST : STAGING;
const BASE_URL = DEFAULT_HOST;

export function CoolEmoji({ width = 16, height = 16, className }: EmojiProps) {
  return (
    <img
      src={`https://${BASE_URL}/images/emojis/cool.png`}
      alt="cool emoji"
      width={width}
      height={height}
      className={className}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

export function HeartEmoji({ width = 16, height = 16, className }: EmojiProps) {
  return (
    <img
      src={`https://${BASE_URL}/images/emojis/heart.png`}
      alt="heart emoji"
      width={width}
      height={height}
      className={className}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

export function StarryEyesEmoji({
  width = 16,
  height = 16,
  className,
}: EmojiProps) {
  return (
    <img
      src={`https://${BASE_URL}/images/emojis/starry-eyes.png`}
      alt="starry eyes emoji"
      width={width}
      height={height}
      className={className}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

export function TongueStickingOutEmoji({
  width = 16,
  height = 16,
  className,
}: EmojiProps) {
  return (
    <img
      src={`https://${BASE_URL}/images/emojis/tongue-sticking-out.png`}
      alt="tongue sticking out emoji"
      width={width}
      height={height}
      className={className}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

export function PartyPopperEmoji({
  width = 16,
  height = 16,
  className,
}: EmojiProps) {
  return (
    <img
      src={`https://${BASE_URL}/images/emojis/party-popper.png`}
      alt="party popper emoji"
      width={width}
      height={height}
      className={className}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

export function HourglassIconEmoji({
  width = 16,
  height = 16,
  className,
}: EmojiProps) {
  const size = Math.max(width || 16, height || 16);
  return (
    <Hourglass size={size} className={className} aria-label="hourglass icon" />
  );
}
