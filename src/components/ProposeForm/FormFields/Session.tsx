import FieldLabel from "../../StrongText";
import type {
  DateTimeHandleChangeType,
  DateTimeHandleDeleteType,
} from "./DateTime";
import DateTime from "./DateTime";
import { Session } from "..";

const DateTimeWrapper = ({
  isRecurring,
  handleChange,
  deleteSessionData,
  danger,
  sessions,
}: {
  isRecurring: boolean;
  handleChange: DateTimeHandleChangeType;
  deleteSessionData: DateTimeHandleDeleteType;
  danger?: boolean;
  sessions: Array<Session>;
}) => {
  return (
    <div className="space-between flex flex-col gap-4">
      <div className="divide-y-2 divide-gray-200">
        {sessions.map((session) => {
          return (
            <DateTime
              count={session.count}
              key={session.count}
              handleChange={handleChange}
              displayDelete={session.count !== 0}
              handleDelete={deleteSessionData}
              deleteSessionData={deleteSessionData}
              session={session}
            />
          );
        })}
      </div>
      {isRecurring ? (
        <div
          className="
              flex
              w-40
              cursor-pointer flex-col
              items-center rounded-lg
              border-2
              border-primary
              py-1.5
              font-secondary
              text-sm uppercase text-primary
            "
          onClick={() =>
            handleChange("dateTime", sessions.length + 1, new Date())
          }
        >
          + Add Session
        </div>
      ) : (
        <></>
      )}
      {danger ? (
        <div className="font-primary text-sm lowercase text-red-400">
          Date invalid or in the past
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

const Session = ({
  isRecurring,
  handleChange,
  deleteSession,
  danger,
  sessions,
}: {
  isRecurring: boolean;
  handleChange: DateTimeHandleChangeType;
  deleteSession: DateTimeHandleDeleteType;
  danger?: boolean;
  sessions: Array<Session>;
}) => {
  return (
    <div>
      <FieldLabel>
        Date & Time&nbsp;
        <span className="font-primary text-sm font-light lowercase">
          Time is in your current timezone (
          <span className="underline">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
          )
        </span>
      </FieldLabel>
      <DateTimeWrapper
        isRecurring={isRecurring}
        handleChange={handleChange}
        deleteSessionData={deleteSession}
        danger={danger}
        sessions={sessions}
      />
    </div>
  );
};

export default Session;
