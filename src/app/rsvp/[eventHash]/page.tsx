import Main from "src/layouts/Main";
import EventWrapper from "src/components/EventPage/EventWrapper";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";

type Props = {
  params: { eventHash: string };
};

// Add revalidation for ISR
export const revalidate = 3600; // revalidate every hour

// Pre-generate important event pages
export async function generateStaticParams() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    console.log("baseUrl: ", baseUrl);
    const url = new URL("/api/query/getActiveEvents", baseUrl).toString();

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch events:",
        response.status,
        response.statusText
      );
      return [];
    }

    const events = await response.json();
    return events.map((event: { hash: string }) => ({
      eventHash: event.hash,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return []; // Return empty array instead of failing build
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const scheme =
    host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  // Parallelize the requests
  const [parentMetadata, eventResponse] = await Promise.all([
    parent,
    fetch(`${scheme}://${host}/api/query/getEventByHash`, {
      body: JSON.stringify({ hash: params.eventHash }),
      method: "POST",
      headers: { "Content-type": "application/json" },
      next: { revalidate: 3600 }, // Cache the API response
    }).then((res) => res.json()),
  ]);

  const event = eventResponse.data;
  const previousImages = parentMetadata.openGraph?.images || [];

  // Enhanced metadata for better SEO
  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      url: `${scheme}://${host}/rsvp/${params.eventHash}`,
      siteName: "Convo Cafe",
      images: ["", ...previousImages],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description,
    },
  };
}

const Post = ({ params }: Props) => {
  const { eventHash } = params;

  return (
    <Main className="px-6 lg:px-52">
      <EventWrapper eventHash={eventHash} />
    </Main>
  );
};

export default Post;
