import isNicknameSet from "src/utils/isNicknameSet";
import { Article } from "../Article";
import Signature from "./Signature";
import type { ClientEvent } from "src/types";

const EventDetails = ({
  html,
  proposer,
}: {
  html: string | null;
  proposer: ClientEvent["proposer"];
}) => {
  return (
    <>
      <div className="font-primary text-lg font-light">Convo Description</div>
      <hr className="rounded-lg border-2 border-secondary-muted" />
      <Article html={html} />
      {isNicknameSet(proposer.nickname) && <Signature user={proposer} />}
    </>
  );
};

export default EventDetails;
