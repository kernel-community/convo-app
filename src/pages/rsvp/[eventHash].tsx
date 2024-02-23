import { useRouter } from "next/router";
import Main from "src/layouts/Main";
import EventWrapper from "src/components/EventPage/EventWrapper";
import { RsvpIntentionProvider } from "src/context/RsvpIntentionContext";
import useEvent from "src/hooks/useEvent";
import { useUser } from "src/context/UserContext";

const Post = ({ hostname }: { hostname: string }) => {
  const { query } = useRouter();
  const { eventHash } = query;
  const { isLoading, isError, data } = useEvent({ hash: eventHash });
  const { fetchedUser: user } = useUser();
  const isEditable = user.id === data?.proposer.id;

  return (
    <Main className="px-6 lg:px-52">
      <RsvpIntentionProvider>
        {!isLoading && !isError && data && (
          <EventWrapper
            event={data}
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
