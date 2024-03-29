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
    <div className="col-span-2">
      <Article html={html} />
      {isNicknameSet(proposer.nickname) && <Signature user={proposer} />}
    </div>
  );
};

export default EventDetails;
