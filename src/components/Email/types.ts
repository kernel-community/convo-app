import { EventType, LocationType } from "@prisma/client";

export interface ConvoEvent {
  id: string;
  title: string;
  descriptionHtml?: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  locationType: LocationType;
  hash: string;
  limit: number;
  sequence: number;
  isDeleted: boolean;
  gCalEventId?: string;
  type: EventType;
  proposerId: string;
  proposerName: string; // From User relation
}

export interface EmailTemplateProps {
  firstName: string;
}

export interface EmailTemplateWithEventProps extends EmailTemplateProps {
  event: ConvoEvent;
}
