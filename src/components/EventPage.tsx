import Hero from "./Hero";
import { Article } from "./Article";
import RsvpSection from "./RsvpSection";
import type { ClientEvent } from "src/types";

const EventPage = ({ event }: { event: ClientEvent }) => {
  // const isSeries = event.series;
  return (
    <>
      <Hero
        title={event.title}
        type={event.type}
        proposer={event.proposer.name}
      />
      <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="col-span-2">
          <Article html={event.descriptionHtml} />
          <div className="pt-24 font-fancy text-4xl text-kernel md:text-5xl">
            {event.proposer.name}
          </div>
        </div>
        <div>
          <RsvpSection
            sessions={event.sessions}
            totalUniqueRSVPs={event.totalUniqueRsvps}
          />
        </div>
      </div>
    </>
  );
};

export default EventPage;
