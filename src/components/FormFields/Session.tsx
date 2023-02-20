import FieldLabel from "../StrongText";
import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import type {
  DateTimeHandleChangeType,
  DateTimeHandleDeleteType,
} from "./DateTime";
import DateTime from "./DateTime";
import type { HandleResetSessionsType } from "./SessionsInput";

const DateTimeWrapper = ({
  isRecurring,
  handleChange,
  resetSessions,
  deleteSessionData,
  danger,
}: {
  isRecurring: boolean;
  handleChange: DateTimeHandleChangeType;
  resetSessions: HandleResetSessionsType;
  deleteSessionData: DateTimeHandleDeleteType;
  danger?: boolean;
}) => {
  const [count, setCount] = useState<number>(0);
  const [sessions, setSessions] = useState<ReactElement[]>([
    <DateTime
      count={count}
      key={count}
      handleChange={handleChange}
      displayDelete={false}
      deleteSessionData={deleteSessionData}
    />,
  ]);
  useEffect(() => {
    setSessions([
      <DateTime
        count={count}
        key={count}
        handleChange={handleChange}
        displayDelete={false}
        deleteSessionData={deleteSessionData}
      />,
    ]);
    resetSessions(isRecurring);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecurring]);
  const deleteSession = (count: number) => {
    setSessions((sessions) => sessions.filter((s) => s.key != count));
  };
  const addSession = () => {
    setSessions(
      sessions.concat(
        <DateTime
          count={count + 1}
          key={count + 1}
          handleChange={handleChange}
          displayDelete={true}
          handleDelete={deleteSession.bind(this)}
          deleteSessionData={deleteSessionData}
        />
      )
    );
    setCount(count + 1);
  };

  return (
    <div className="space-between flex flex-col gap-4">
      <div className="divide-y-2 divide-gray-200">{sessions}</div>
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
          onClick={addSession}
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
  resetSessions,
  deleteSession,
  danger,
}: {
  isRecurring: boolean;
  handleChange: DateTimeHandleChangeType;
  resetSessions: HandleResetSessionsType;
  deleteSession: DateTimeHandleDeleteType;
  danger?: boolean;
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
        resetSessions={resetSessions}
        deleteSessionData={deleteSession}
        danger={danger}
      />
    </div>
  );
};

export default Session;
