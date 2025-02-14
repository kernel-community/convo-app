"use client";

import ProposeForm from "src/components/ProposeForm";
import useEvent from "src/hooks/useEvent";
import Main from "src/layouts/Main";
import parse from "src/utils/clientEventToClientEventInput";
import { Button } from "src/components/ui/button";
import useDeleteEvent from "src/hooks/useDeleteEvent";
import { useUser } from "src/context/UserContext";
import NotAllowedPage from "src/components/NotAllowedPage";
import { useEffect, useState } from "react";
import { Skeleton } from "src/components/ui/skeleton";
import ConfirmDeleteCredenza from "src/components/EventPage/ConfirmDelete";
import { useRouter } from "next/navigation";
import type { ClientEventInput } from "src/types";
import { upsertConvo } from "src/utils/upsertConvo";

const Edit = ({ params }: { params: { eventHash: string } }) => {
  const { push } = useRouter();
  const { eventHash } = params;
  const { data, isLoading: isEventLoading } = useEvent({
    hash: eventHash,
    dontFetch: true,
  });
  const { deleteEvent, isDeleting } = useDeleteEvent();
  const { fetchedUser: user } = useUser();
  const [isInvalidRequest, setInvalidRequest] = useState(false);
  const [openModalFlag, setOpenModalFlag] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // check to see if eventHash from query exists in the database
  // parse and pre-fill event data in the form
  const clientEventInput: ClientEventInput | undefined = data
    ? parse(data)
    : undefined;

  console.log({ clientEventInput });

  useEffect(() => {
    if (data && user && user.id !== data.proposerId) {
      setInvalidRequest(true);
    }
  }, [user, data]);

  if (isEventLoading || !user) {
    return (
      <Main>
        <div className="flex flex-col items-center justify-center">
          <div className="flex w-full flex-col items-center justify-between sm:flex-row">
            <div className="font-heading dark:text-primary-dark px-8 text-4xl font-extrabold text-primary sm:text-5xl">
              <Skeleton className="h-12 w-64" />
            </div>
          </div>
          <div className="dark:border-primary-dark my-12 w-full border border-primary"></div>
        </div>
      </Main>
    );
  }

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

  const handleDelete = async () => {
    const success = await deleteEvent(eventHash);
    if (success) {
      // Redirect to home page after successful deletion
      push("/");
    }
  };

  return (
    <>
      <Main className="container mx-auto">
        <ConfirmDeleteCredenza
          openModalFlag={openModalFlag}
          setOpenModalFlag={setOpenModalFlag}
          action={handleDelete}
          isLoading={isDeleting}
        />
        <div className="flex flex-col items-center justify-center">
          <div className="flex w-full flex-col items-center justify-between sm:flex-row">
            <div
              className="
              px-8
              font-primary
              text-4xl
              font-semibold
              text-foreground
              sm:text-5xl
            "
            >
              Editing: {clientEventInput?.title}
            </div>
            {isSubmitting ? (
              <Button disabled className="w-[250px] p-0">
                <Skeleton className="bg-gray-550 h-full w-full" />
              </Button>
            ) : (
              <Button onClick={() => setOpenModalFlag(true)}>
                Delete all events?
              </Button>
            )}
          </div>
          <div className="dark:border-primary-dark my-12 w-full border border-primary"></div>
        </div>
        <ProposeForm event={clientEventInput} />
      </Main>
    </>
  );
};
export default Edit;
