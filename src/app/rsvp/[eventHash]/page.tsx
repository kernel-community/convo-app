import Main from "src/layouts/Main";
import EventWrapper from "src/components/EventPage/EventWrapper";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

type Props = {
  params: { eventHash: string };
};

// Remove generateStaticParams completely and rely only on ISR
export const revalidate = 3600; // revalidate every hour

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const scheme =
    host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  try {
    // Parallelize the requests
    const [parentMetadata, response] = await Promise.all([
      parent,
      fetch(`${scheme}://${host}/api/query/getEventByHash`, {
        body: JSON.stringify({ hash: params.eventHash }),
        method: "POST",
        headers: { "Content-type": "application/json" },
        next: { revalidate: 3600 },
      }),
    ]);

    if (!response.ok) {
      notFound();
    }

    const eventResponse = await response.json();
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
  } catch (error) {
    notFound();
  }
}

const Post = async ({ params }: Props) => {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const scheme =
    host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  // Move the data fetching to the client component (EventWrapper)
  // This prevents hydration issues by ensuring consistent rendering
  return (
    <Main className="px-6 lg:px-52">
      <EventWrapper eventHash={params.eventHash} />
    </Main>
  );
};

export default Post;
