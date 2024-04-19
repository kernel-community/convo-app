import Main from "src/layouts/Main";
import EventWrapper from "src/components/EventPage/EventWrapper";
import { RsvpIntentionProvider } from "src/context/RsvpIntentionContext";
import { useUser } from "src/context/UserContext";
import useEvent from "src/hooks/useEvent";
import { useRouter } from "next/router";

const Post = ({ hostname }: { hostname: string }) => {
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
    <Main className="px-6 lg:px-52">
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
