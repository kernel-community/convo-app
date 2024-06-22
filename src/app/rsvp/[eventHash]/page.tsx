import Main from "src/layouts/Main";
import EventWrapper from "src/components/EventPage/EventWrapper";
import type { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";

type Props = {
  params: { eventHash: string };
};

const Post = ({ params }: Props) => {
  const { eventHash } = params;

  return (
    <Main className="px-6 lg:px-52">
      <EventWrapper eventHash={eventHash} />
    </Main>
  );
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetching for headers will make this a dynamic page
  const headersList = headers();
  const host = headersList.get("host") || "";
  const scheme =
    host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const data = (
    await fetch(`${scheme}://${host}/api/query/getEventByHash`, {
      body: JSON.stringify({ hash: params.eventHash }),
      method: "POST",
      headers: { "Content-type": "application/json" },
    }).then((res) => res.json())
  ).data;
  const previousImages = (await parent).openGraph?.images || [];
  return {
    title: data.title,
    openGraph: {
      images: ["", ...previousImages],
    },
  };
}

export default Post;
