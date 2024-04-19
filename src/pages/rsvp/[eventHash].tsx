import Main from "src/layouts/Main";
import EventWrapper from "src/components/EventPage/EventWrapper";
import { RsvpIntentionProvider } from "src/context/RsvpIntentionContext";
import { useUser } from "src/context/UserContext";
import Head from "next/head";
import type { ClientEvent } from "src/types";
import useEvent from "src/hooks/useEvent";
import { useRouter } from "next/router";
import { Suspense } from "react";

const Post = ({ hostname, data }: { hostname: string; data: ClientEvent }) => {
  const { fetchedUser: user } = useUser();

  const { query } = useRouter();
  const { eventHash } = query;
  const {
    isLoading,
    isError,
    data: fetchedEventData,
  } = useEvent({ hash: eventHash });

  const isEditable =
    user && fetchedEventData ? user.id === fetchedEventData.proposerId : false;

  return (
    <Suspense fallback={<p>Loading post...</p>}>
      <Main className="px-6 lg:px-52">
        <Head>
          <title>{`Convo | ${data.title}`}</title>
          <meta name="description" content="The kernel of a conversation" />
          {/* OpenGraph */}
          <meta
            property="og:title"
            content={`Convo | ${data?.title}`}
            key="title"
          />
          <meta
            property="og:url"
            content={
              hostname.includes("localhost")
                ? `http://${hostname}`
                : `https://${hostname}`
            }
          />
          <meta
            property="og:image"
            content="https://confab-frontend.vercel.app/images/banner.jpg"
          />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`Convo | ${data?.title}`} />
          <meta
            name="twitter:image"
            content="https://confab-frontend.vercel.app/images/banner.jpg"
          />

          <meta name="robots" content="index, follow, nocache" />
          <meta
            name="googlebot"
            content="index, follow, noimageindex, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
          />
        </Head>
        <RsvpIntentionProvider>
          {!isLoading && !isError && fetchedEventData && (
            <EventWrapper
              event={fetchedEventData}
              isEditable={isEditable}
              hostname={hostname}
            />
          )}
        </RsvpIntentionProvider>
      </Main>
    </Suspense>
  );
};

const fetchEventData = async (hash: string, prefix: string) => {
  try {
    const r = (
      await (
        await fetch(`${prefix}/api/query/getEventByHash`, {
          body: JSON.stringify({ hash }),
          method: "POST",
          headers: { "Content-type": "application/json" },
        })
      ).json()
    ).data;
    return r;
  } catch (err) {
    throw err;
  }
};

// i forgot why i needed server side rendering here 😐
export async function getServerSideProps(context: any) {
  const hash = context.params["eventHash"];
  const host = context.req.headers.host;
  const prefix = host.includes("localhost")
    ? `http://${host}`
    : `https://${host}`;
  const r = await fetchEventData(hash, prefix);

  return {
    props: {
      // Access the host from the headers (consider the "x-forwarded-host" if behind a proxy)
      hostname: context.req.headers.host,
      data: r,
    },
  };
}

export default Post;
