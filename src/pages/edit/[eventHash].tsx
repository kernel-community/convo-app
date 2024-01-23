import type { NextPage } from "next";
import { useRouter } from "next/router";
import type { ClientEventInput } from "src/components/ProposeForm";
import ProposeForm from "src/components/ProposeForm";
import useEvent from "src/hooks/useEvent";
import Main from "src/layouts/Main";
import parse from "src/utils/clientEventToClientEventInput";
import NotFoundPage from "../404";
import { Button } from "src/components/ui/button";
import useUpdateEvent from "src/hooks/useUpdateEvent";
import { useUser } from "src/context/UserContext";
import NotAllowedPage from "src/components/NotAllowedPage";
import { useEffect, useState } from "react";

const Edit: NextPage = () => {
  const { query } = useRouter();
  const { eventHash } = query;
  const { data } = useEvent({ hash: eventHash });
  const { update } = useUpdateEvent();
  const { fetchedUser: user } = useUser();
  const [isInvalidRequest, setInvalidRequest] = useState(false);

  // check to see if eventHash from query exists in the database
  // parse and pre-fill event data in the form
  const clientEventInput: ClientEventInput | undefined = data
    ? parse(data)
    : undefined;

  useEffect(() => {
    if (data && user && user.id !== data.proposerId) {
      setInvalidRequest(true);
    }
  }, [user, data]);

  if (!clientEventInput) {
    return <NotFoundPage />;
  }

  if (isInvalidRequest) {
    return (
      <NotAllowedPage
        message={`Event ${data.hash} is owned by ${data.proposer.nickname}. Connected account is ${user.address} (${user.nickname})`}
      />
    );
  }

  const deleteEvent = async () => {
    const event = {
      ...clientEventInput,
      sessions: [],
      hash: eventHash as string,
    };
    await update({ event });
  };

  return (
    <>
      <Main>
        <div className="flex flex-col items-center justify-center lg:px-64">
          <div className="flex w-full flex-row items-center justify-between">
            <div
              className="
              font-heading
              text-5xl
              font-extrabold
              text-primary
              sm:text-5xl
            "
            >
              Editing: {clientEventInput?.title}
            </div>
            <Button onClick={deleteEvent}>Delete all events?</Button>
          </div>
          <div className="my-12 w-full border border-primary"></div>
        </div>
        <div className="lg:px-96">
          <ProposeForm event={clientEventInput} />
        </div>
      </Main>
    </>
  );
};
export default Edit;
