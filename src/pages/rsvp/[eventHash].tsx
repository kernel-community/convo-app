import { useRouter } from "next/router";
import Main from "src/layouts/Main";
import EventWrapper from "src/components/EventPage/EventWrapper";
import { RsvpIntentionProvider } from "src/context/RsvpIntentionContext";
import useEvent from "src/hooks/useEvent";

const Post = () => {
  const { query } = useRouter();
  const { eventHash } = query;
  const { isLoading, isError, data } = useEvent({ hash: eventHash });
  return (
    <Main
      className="
      container
      mx-auto
    "
    >
      <RsvpIntentionProvider>
        {!isLoading && !isError && data && <EventWrapper event={data} />}
      </RsvpIntentionProvider>
    </Main>
  );
};

export default Post;
