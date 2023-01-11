import Hero from "./Hero";
import { Article } from "./Article";
import RsvpSection from "./RsvpSection";
import type { ClientEvent } from "src/types";
import { useRouter } from "next/router";
import prisma, { Event, Prisma, User } from "@prisma/client";

const EventPage = ({ event }: { event: ClientEvent }) => {
  const isSeries = event.series;
  return (
    <>
      <Hero
        title={event.title}
        type={event.type}
        proposer={event.proposer.username}
      />
      <div className="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="col-span-2">
          <Article html={event.descriptionHtml} />
          <div className="pt-24 font-fancy text-4xl text-kernel md:text-5xl">
            {event.proposer.username}
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
