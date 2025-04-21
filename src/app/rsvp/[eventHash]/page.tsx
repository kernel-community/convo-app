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
    // Fetch the event data
    const response = await fetch(`${baseUrl}/api/query/getEventByHash`, {
      body: JSON.stringify({ hash: params.eventHash }),
      method: "POST",
      headers: { "Content-type": "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      notFound();
    }

    const eventResponse = await response.json();
    const event = eventResponse.data;

    // Enhanced metadata for better SEO
    const formattedDate = event.startDateTime
      ? new Date(event.startDateTime).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        })
      : "";

    const metaTitle = `${event.title} | Convo Cafe`;
    const metaDescription = `Join us for ${event.title} on ${formattedDate}. ${event.description}`;

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
