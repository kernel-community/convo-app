"use client";

import Main from "src/layouts/Main";
import EventWrapper from "src/components/EventPage/EventWrapper";
import { RsvpIntentionProvider } from "src/context/RsvpIntentionContext";
import { useUser } from "src/context/UserContext";
import useEvent from "src/hooks/useEvent";

const Post = ({
  hostname,
  params,
}: {
  hostname: string;
  params: { eventHash: string };
}) => {
  const { fetchedUser: user } = useUser();
  const { eventHash } = params;
  const {
    isLoading,
    isError,
    data: fetchedEventData,
  } = useEvent({ hash: eventHash });

  const isEditable =
    user && fetchedEventData ? user.id === fetchedEventData.proposerId : false;

  return (
    <Main className="px-6 lg:px-52">
      <RsvpIntentionProvider>
        {!isLoading && !isError && fetchedEventData && (
          <EventWrapper
            event={fetchedEventData}
            isEditable={isEditable}
            hostname={hostname}
            eventHash={eventHash}
          />
        )}
      </RsvpIntentionProvider>
    </Main>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: {
      // Access the host from the headers (consider the "x-forwarded-host" if behind a proxy)
      hostname: context.req.headers.host,
    },
  };
}
export default Post;
