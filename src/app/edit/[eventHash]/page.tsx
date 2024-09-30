"use client";

import ProposeForm from "src/components/ProposeForm";
import useEvent from "src/hooks/useEvent";
import Main from "src/layouts/Main";
import parse from "src/utils/clientEventToClientEventInput";
import { Button } from "src/components/ui/button";
import useUpdateEvent from "src/hooks/useUpdateEvent";
import { useUser } from "src/context/UserContext";
import NotAllowedPage from "src/components/NotAllowedPage";
import { useEffect, useState } from "react";
import { Skeleton } from "src/components/ui/skeleton";
import ConfirmDeleteCredenza from "src/components/EventPage/ConfirmDelete";
import { useRouter } from "next/navigation";
import type { ClientEventInput } from "src/types";

const Edit = ({ params }: { params: { eventHash: string } }) => {
  const { push } = useRouter();
  const { eventHash } = params;
  const { data } = useEvent({ hash: eventHash });
  const { update, isSubmitting: isLoading } = useUpdateEvent();
  const { fetchedUser: user } = useUser();
  const [isInvalidRequest, setInvalidRequest] = useState(false);
  const [openModalFlag, setOpenModalFlag] = useState<boolean>(false);

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
    return <div>not found</div>;
  }

  if (isInvalidRequest) {
    return (
      <NotAllowedPage
        message={`Event ${data.hash} is owned by ${data.proposer.nickname}. Connected account is ${user.id} (${user.nickname})`}
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
    push(`/rsvp/${event.hash}`);
  };

  return (
    <>
      <Main>
        <ConfirmDeleteCredenza
          openModalFlag={openModalFlag}
          setOpenModalFlag={setOpenModalFlag}
          action={deleteEvent}
          isLoading={isLoading}
        />
        <div className="flex flex-col items-center justify-center lg:px-64">
          <div className="flex w-full flex-col items-center justify-between sm:flex-row">
            <div
              className="
              px-8
              font-heading
              text-4xl
              font-extrabold
              text-primary dark:text-primary-dark
              sm:text-5xl
            "
            >
              Editing: {clientEventInput?.title}
            </div>
            {isLoading ? (
              <Button disabled className="w-[250px] p-0">
                <Skeleton className="bg-gray-550 h-full w-full" />
              </Button>
            ) : (
              <Button onClick={() => setOpenModalFlag(true)}>
                Delete all events?
              </Button>
            )}
          </div>
          <div className="my-12 w-full border border-primary dark:border-primary-dark"></div>
        </div>
        <div className="px-8 lg:px-96">
          <ProposeForm event={clientEventInput} />
        </div>
      </Main>
    </>
  );
};
export default Edit;
