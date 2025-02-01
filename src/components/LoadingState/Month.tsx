export const MonthLoadingState = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <CalendarLoadingState />
      </div>
      <div className="col-span-1">
        <EventsListLoadingState />
      </div>
    </div>
  );
};

const CalendarLoadingState = () => {
  return (
    <div className="relative isolate h-[740px] overflow-hidden rounded-lg shadow-xl shadow-kernel/5">
      <div className="absolute h-full w-full -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-skin/5 via-skin/30 to-skin/5" />
      <div className="rounded-2xl absolute h-full w-full bg-black/5 p-4">
        {/* Month header */}
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="h-8 w-8 rounded-md bg-skin/30" />
          <div className="h-6 w-32 rounded-md bg-skin/20" />
          <div className="h-8 w-8 rounded-md bg-skin/30" />
        </div>

        {/* Calendar grid */}
        <div className="space-y-8">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-6 rounded-md bg-skin/20" />
            ))}
          </div>

          {/* Calendar days */}
          {Array.from({ length: 5 }).map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="aspect-square rounded-md bg-skin/10"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EventsListLoadingState = () => {
  return (
    <div className="relative isolate flex h-[740px] flex-col overflow-hidden rounded-lg shadow-xl shadow-kernel/5">
      <div className="absolute h-full w-full -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-skin/5 via-skin/30 to-skin/5" />
      <div className="rounded-2xl absolute h-full w-full bg-black/5">
        {/* Header */}
        <div className="border-b p-4">
          <div className="h-6 w-48 rounded-md bg-skin/30" />
        </div>

        {/* Events */}
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-3/4 rounded-md bg-skin/20" />
              <div className="h-4 w-1/2 rounded-md bg-skin/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
