import Main from "src/layouts/Main";
import EventWrapper from "src/components/EventPage/EventWrapper";
import type { Metadata } from "next";

import { notFound } from "next/navigation";

type Props = {
  params: { eventHash: string };
};

// Remove generateStaticParams completely and rely only on ISR
export const revalidate = 3600; // revalidate every hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.convo.cafe";

  try {
    // Fetch the event data with reduced caching for more timely updates
    const response = await fetch(`${baseUrl}/api/query/getEventByHash`, {
      body: JSON.stringify({ hash: params.eventHash }),
      method: "POST",
      headers: { "Content-type": "application/json" },
      cache: "no-store", // Disable caching completely to always fetch fresh data
    });

    if (!response.ok) {
      notFound();
    }

    const eventResponse = await response.json();
    const event = eventResponse.data;

    // Enhanced metadata for better SEO
    const formattedDate = event.startDateTime
      ? (() => {
          // If creationTimezone exists, format the date in that timezone
          if (event.creationTimezone) {
            // Format date with explicit timezone mention
            const options: Intl.DateTimeFormatOptions = {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: event.creationTimezone,
              timeZoneName: "short",
            };
            return new Date(event.startDateTime).toLocaleString(
              "en-US",
              options
            );
          } else {
            // Use current behavior if no timezone is specified
            return new Date(event.startDateTime).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            });
          }
        })()
      : "";

    // Include community name in the title if available
    const metaTitle = event.community
      ? `${event.title} | ${event.community.displayName} | Convo Cafe`
      : `${event.title} | Convo Cafe`;
    // Include community name in the description if available
    const metaDescription = event.community
      ? `Join us for ${event.title} by ${event.community.displayName} on ${formattedDate}.`
      : `Join us for ${event.title} on ${formattedDate}.`;

    // Generate dynamic OG image URL
    const imageUrl = new URL(`${baseUrl}/api/og/convo-cover-image`);
    imageUrl.searchParams.set("title", event.title);
    imageUrl.searchParams.set("startDateTime", event.startDateTime);
    imageUrl.searchParams.set("eventHash", params.eventHash);
    if (event.recurrenceRule) {
      imageUrl.searchParams.set("recurrenceRule", event.recurrenceRule);
    }
    if (event.proposers?.[0]?.user?.nickname) {
      imageUrl.searchParams.set(
        "proposerNickname",
        event.proposers[0].user.nickname
      );
    }
    // Pass the creation timezone if available
    if (event.creationTimezone) {
      imageUrl.searchParams.set("creationTimezone", event.creationTimezone);
    }

    // Add community name to OG image if available
    if (event.community) {
      imageUrl.searchParams.set("communityName", event.community.displayName);
    }

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `${baseUrl}/rsvp/${params.eventHash}`,
        siteName: "Convo Cafe",
        images: [imageUrl.toString()],
        locale: "en_US",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDescription,
        images: [imageUrl.toString()],
      },
    };
  } catch (error) {
    notFound();
  }
}

const Post = async ({ params }: Props) => {
  // Move the data fetching to the client component (EventWrapper)
  // This prevents hydration issues by ensuring consistent rendering
  return (
    <Main className="container">
      <EventWrapper eventHash={params.eventHash} />
    </Main>
  );
};

export default Post;
