import { Article } from "../Article";

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
      <div className="pt-24 font-fancy text-4xl text-kernel md:text-5xl">
        {proposer}
      </div>
    </div>
  );
};

export default EventDetails;
