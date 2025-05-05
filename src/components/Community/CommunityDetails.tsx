"use client";

import { useState } from "react";
import { Calendar, Clock, Globe, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Badge } from "src/components/ui/badge";
import type { Community, Event, Slack } from "@prisma/client";

type CommunityWithRelations = Community & {
  slack: Slack | null;
  events: Event[];
};

interface CommunityDetailsProps {
  community: CommunityWithRelations;
}

export default function CommunityDetails({ community }: CommunityDetailsProps) {
  const [activeTab, setActiveTab] = useState("about");

  // Function to generate community-specific URLs
  const getCommunityUrl = (path: string) => {
    // Check if we're on localhost
    const host = typeof window !== "undefined" ? window.location.host : "";
    const isLocalhost =
      host.includes("localhost") || host.includes("127.0.0.1");

    if (isLocalhost) {
      // For localhost, we'll use a special format that the middleware can interpret
      // This assumes your middleware can handle this format
      return `${window.location.protocol}//${community.subdomain}.${host}/propose`;
    } else {
      // For production, use the subdomain format
      const baseDomain = host.split(".").slice(1).join(".");
      return `${window.location.protocol}//${community.subdomain}.${baseDomain}${path}`;
    }
  };

  return (
    <div className="space-y-8 py-10">
      {/* Community Header */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
        <div className="space-y-2">
          <h1 className="font-primary text-4xl font-semibold">
            {community.displayName}
          </h1>
          <p className="text-lg text-muted-foreground">
            {community.description}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {community.subdomain}.convo.cafe
            </span>

            {community.url && (
              <>
                <span className="mx-2 text-muted-foreground">•</span>
                <Link
                  href={community.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-primary hover:underline"
                >
                  <Globe className="mr-1 h-4 w-4" />
                  Website
                </Link>
              </>
            )}
          </div>
        </div>
        {/* <div className="flex flex-wrap gap-2">
          <Button variant="default">
            Join Community
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            View Members
          </Button>
        </div> */}
      </div>

      <Separator />

      {/* Community Content Tabs */}
      <Tabs
        defaultValue="about"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-8">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Information</CardTitle>
              <CardDescription>
                Details about the {community.displayName} community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">Description</h3>
                <p>{community.description}</p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {community.slack && (
                    <Badge variant="secondary">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Slack Integration
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    <Calendar className="mr-1 h-3 w-3" />
                    Events
                  </Badge>
                  {/* Add more badges based on community features */}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Created</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(community.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-primary text-2xl font-semibold">
              Community Events
            </h2>
            <Link
              href={getCommunityUrl("/propose")}
              className="text-primary hover:underline"
            >
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>

          {community.events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {community.events.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">
                      <Link
                        href={`/rsvp/${event.hash}`}
                        className="transition-colors hover:text-primary"
                      >
                        {event.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(
                        event.startDateTime
                      ).toLocaleDateString()} at{" "}
                      {new Date(event.startDateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {event.descriptionHtml ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html:
                              event.descriptionHtml
                                .replace(/<[^>]*>/g, " ")
                                .substring(0, 150) + "...",
                          }}
                        />
                      ) : (
                        "No description available"
                      )}
                    </p>
                    <div className="mt-4">
                      <Link href={`/rsvp/${event.hash}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Event
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="mb-4 text-muted-foreground">
                No events found for this community
              </p>
              <Link href={getCommunityUrl("/propose")}>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Create the first event
                </Button>
              </Link>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
