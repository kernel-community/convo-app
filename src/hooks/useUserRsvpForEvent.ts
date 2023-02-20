import { useEffect, useState } from "react";

const useUserRsvpForEvent = ({
  eventId,
  attendeeAddress,
}: {
  eventId: string;
  attendeeAddress: string | undefined;
}) => {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isRsvpd, setIsRsvpd] = useState<boolean>(false);
  const getRsvp = async ({
    address,
    event,
  }: {
    address: string;
    event: string;
  }) => {
    let res;
    setIsFetching(true);
    try {
      res = (
        await (
          await fetch("/api/query/getUserRsvpForEvent", {
            body: JSON.stringify({
              address,
              event,
            }),
            method: "POST",
            headers: { "Content-type": "application/json" },
          })
        ).json()
      ).data;
    } catch (err) {
      setIsFetching(false);
      throw err;
    }
    setIsRsvpd(res.isRsvp);
    setIsFetching(false);
    return res;
  };
  useEffect(() => {
    if (!attendeeAddress) return;
    getRsvp({
      address: attendeeAddress,
      event: eventId,
    });
  }, [eventId, attendeeAddress]);

  return {
    isFetching,
    refetch: getRsvp,
    isRsvpd,
  };
};

export default useUserRsvpForEvent;
