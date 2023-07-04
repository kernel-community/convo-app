import type { NextPage } from "next";
import { useRouter } from "next/router";
import type { ClientEventInput } from "src/components/ProposeForm";
import ProposeForm from "src/components/ProposeForm";
import useEvent from "src/hooks/useEvent";
import Main from "src/layouts/Main";
import parse from "src/utils/clientEventToClientEventInput";
import NotFoundPage from "../404";
import Button from "src/components/Button";
import useUpdateEvent from "src/hooks/useUpdateEvent";
import { useSignMessage } from "wagmi";
import { useUser } from "src/context/UserContext";

const Edit: NextPage = () => {
  const { query } = useRouter();
  const { eventHash } = query;
  const { data } = useEvent({ hash: eventHash });

  const { signMessageAsync } = useSignMessage();
  const { update } = useUpdateEvent();
  const { fetchedUser: user } = useUser();

  // check to see if eventHash from query exists in the database
  // parse and pre-fill event data in the form
  const clientEventInput: ClientEventInput | undefined = data
    ? parse(data)
    : undefined;

  if (!clientEventInput) {
    return <NotFoundPage />;
  }

  const deleteEvent = async () => {
    const messageToSign = {
      ...clientEventInput,
      sessions: [],
      hash: eventHash as string,
    };
    const signature = await signMessageAsync({
      message: JSON.stringify(messageToSign),
    });
    await update({
      event: messageToSign,
      signature,
      address: user.address,
    });
  };

  return (
    <>
      <Main>
        <div className="flex flex-col items-center justify-center">
          <div
            className="
            mx-auto
            font-heading
            text-5xl
            font-extrabold
            text-primary
            sm:text-5xl
          "
          >
            Editing: {clientEventInput?.title}
          </div>
          <Button buttonText="Delete all events" handleClick={deleteEvent} />
          <div className="my-12 w-full border border-primary lg:w-9/12"></div>
        </div>
        <div className="lg:px-32">
          <ProposeForm event={clientEventInput} />
        </div>
      </Main>
    </>
  );
};
export default Edit;
