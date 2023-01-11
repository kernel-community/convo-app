import { useRouter } from "next/router";
import Main from "src/layouts/Main";
import EventPage from "src/components/EventPage";
import { useQuery } from "react-query";

const Post = () => {
  const { query } = useRouter();
  const { eventHash } = query;
  const { isLoading, isError, data, isFetching } = useQuery(
    `rsvp_${eventHash}`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/getEventByHash", {
              body: JSON.stringify({ hash: eventHash }),
              method: "POST",
              headers: { "Content-type": "application/json" },
            })
          ).json()
        ).data;
        return r;
      } catch (err) {
        throw err;
      }
    },
    {
      refetchInterval: 60000,
    }
  );
  console.log({ data });
  return (
    <Main
      className="
      container
      mx-auto
    "
    >
      {/* @todo */}
      {isLoading && <div>Loading...</div>}
      {isFetching && <div>Fetching data...</div>}
      {isError && <div>There was an error</div>}
      {!isLoading && !isError && data && <EventPage event={data} />}
    </Main>
  );
};

export default Post;
