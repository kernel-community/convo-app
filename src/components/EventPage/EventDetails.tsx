import isNicknameSet from "src/utils/isNicknameSet";
import { Article } from "../Article";
import Signature from "./Signature";

const EventDetails = ({
  html,
  proposer,
}: {
  html: string | null;
  proposer: string | null;
}) => {
  return (
    <div className="col-span-2">
      <Article html={html} />
      {isNicknameSet(proposer) && <Signature sign={proposer} />}
    </div>
  );
};

export default EventDetails;
