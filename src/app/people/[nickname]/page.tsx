"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  User as UserIcon,
  Globe,
  Briefcase,
  Tag,
  Link as LinkIcon,
  Calendar,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

// Layout and UI components
import Main from "src/layouts/Main";
import { Card } from "src/components/ui/card";
import { Separator } from "src/components/ui/separator";
import { Button } from "src/components/ui/button";
import { Skeleton } from "src/components/ui/skeleton";
import { DEFAULT_PROFILE_PICTURES } from "src/utils/constants";

// Custom hooks
import useUserEvents from "src/hooks/useUserEvents";

// Types
import type { User, Profile } from "@prisma/client";
import type { ClientEvent } from "src/types";

// Combined user and profile type
type UserWithProfile = User & {
  profile: Profile | null;
};

export default function ProfilePage() {
  const params = useParams();
  const nickname = params.nickname as string;

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchUserByNickname = async () => {
      if (!nickname) return;

      setIsLoading(true);
      try {
        console.log(`Fetching user data for nickname: ${nickname}`);
        const response = await fetch(
          `/api/query/user-by-nickname?nickname=${encodeURIComponent(nickname)}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User not found");
          }
          throw new Error(`Failed to fetch user: ${response.status}`);
        }

        const data = await response.json();
        console.log("User data received:", data.data ? "success" : "empty");
        setUser(data.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    };

    fetchUserByNickname();
  }, [nickname]);

  // Fetch user's events
  const { data: eventsData, isLoading: eventsLoading } = useUserEvents({
    userId: user?.id,
  });

  // Get profile picture (either from user profile or a default)
  const profilePicture =
    user?.profile?.image ||
    DEFAULT_PROFILE_PICTURES[0] ||
    "/images/default-avatar.png";

  // The current date to separate past and future events
  const now = new Date();

  // Split events into future and past categories
  const futureEvents = !eventsData
    ? []
    : [...(eventsData.proposed || [])]
        .filter((event) => new Date(event.startDateTime) >= now)
        .sort(
          (a, b) =>
            new Date(a.startDateTime).getTime() -
            new Date(b.startDateTime).getTime()
        )
        .slice(0, 3); // Show up to 3 upcoming events

  const pastEvents = !eventsData
    ? []
    : [...(eventsData.proposed || [])]
        .filter((event) => new Date(event.startDateTime) < now)
        .sort(
          (a, b) =>
            new Date(b.startDateTime).getTime() -
            new Date(a.startDateTime).getTime()
        )
        .slice(0, 3); // Show up to 3 past events

  return (
    <Main>
      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8">
        {isLoading ? (
          <ProfileSkeleton />
        ) : hasFetched && error ? (
          <ErrorDisplay message={error} />
        ) : hasFetched && !user ? (
          <ErrorDisplay message="User not found" />
        ) : user ? (
          <div className="space-y-8">
            {/* Profile header */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-background shadow-lg">
                <Image
                  src={profilePicture}
                  alt={user.nickname || "User"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col items-center sm:items-start">
                <h1 className="font-primary text-3xl">{user.nickname}</h1>
                {user.profile?.currentAffiliation && (
                  <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{user.profile.currentAffiliation}</span>
                  </div>
                )}
                {user.profile?.url && (
                  <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <a
                      href={
                        user.profile.url.startsWith("http")
                          ? user.profile.url
                          : `https://${user.profile.url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {user.profile.url.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}

                <div className="mt-6 w-full space-y-2">
                  <Link href={`/nook?id=${user.id}`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Users className="mr-2 h-4 w-4" />
                      See Connections
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <Separator />

            {/* About section */}
            {user.profile?.bio && (
              <Card className="p-6">
                <h2 className="mb-4 font-primary text-xl font-semibold">
                  About
                </h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {user.profile.bio}
                </p>
              </Card>
            )}

            {/* Keywords/tags */}
            {user.profile?.keywords && user.profile.keywords.length > 0 && (
              <Card className="p-6">
                <h2 className="mb-4 font-primary text-xl font-semibold">
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.profile.keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                    >
                      <Tag className="h-3 w-3" />
                      {keyword}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Events section */}
            <Card className="p-6">
              <h2 className="mb-4 font-primary text-xl font-semibold">
                Events Organized
              </h2>

              {eventsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : futureEvents.length === 0 && pastEvents.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>No organized events found</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Upcoming Events Section */}
                  <div>
                    <h3 className="text-md mb-3 font-medium text-muted-foreground">
                      Upcoming Events
                    </h3>
                    {futureEvents.length > 0 ? (
                      <div className="space-y-4">
                        {futureEvents.map((event) => (
                          <Link
                            href={`/${event.hash}`}
                            key={event.id}
                            className="block"
                          >
                            <div className="flex items-start gap-4 rounded-md p-3 transition-colors hover:bg-muted">
                              <div className="bg-primary/5 rounded-md p-2 text-primary">
                                <Calendar className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="line-clamp-1 font-medium text-foreground">
                                  {event.title}
                                </h3>
                                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {format(
                                      new Date(event.startDateTime),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span className="line-clamp-1">
                                        {event.location}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center py-3 text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>No upcoming events</span>
                      </div>
                    )}
                  </div>

                  {/* Past Events Section */}
                  <div>
                    <h3 className="text-md mb-3 font-medium text-muted-foreground">
                      Past Events
                    </h3>
                    {pastEvents.length > 0 ? (
                      <div className="space-y-4">
                        {pastEvents.map((event) => (
                          <Link
                            href={`/${event.hash}`}
                            key={event.id}
                            className="block"
                          >
                            <div className="flex items-start gap-4 rounded-md p-3 transition-colors hover:bg-muted">
                              <div className="bg-primary/5 rounded-md p-2 text-primary">
                                <Calendar className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="line-clamp-1 font-medium text-foreground">
                                  {event.title}
                                </h3>
                                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {format(
                                      new Date(event.startDateTime),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span className="line-clamp-1">
                                        {event.location}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center py-3 text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>No past events</span>
                      </div>
                    )}
                  </div>

                  {/* View All Links */}
                  <div className="mt-2 border-t pt-2">
                    <div className="flex gap-4">
                      <Link href={`/all?user=${user.nickname}`}>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-primary"
                        >
                          View all organized events
                        </Button>
                      </Link>
                      <Link href={`/archive?user=${user.nickname}`}>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-primary"
                        >
                          View past organized events
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <ProfileSkeleton />
        )}
      </div>
    </Main>
  );
}

// Loading skeleton component
function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Skeleton className="h-40 w-40 rounded-full" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-32" />
          <div className="pt-4">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Error display component
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-2 text-xl font-semibold text-destructive">Error</div>
      <p className="mb-6 text-muted-foreground">{message}</p>
      <Link href="/">
        <Button>Return to Homepage</Button>
      </Link>
    </div>
  );
}
