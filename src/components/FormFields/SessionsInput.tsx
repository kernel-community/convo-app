import Session from "./Session";
import { useState } from "react";
import FieldLabel from "../StrongText";
import type {
  DateTimeHandleChangeType,
  DateTimeHandleDeleteType,
} from "./DateTime";
import type { Session as SessionType } from "../ProposeForm";
import _ from "lodash";

export type HandleResetSessionsType = (flag: boolean) => void;

const SessionsInput = ({
  handleChange,
  resetSessions,
  deleteSession,
  danger,
}: {
  handleChange: (sessions: Array<SessionType>) => void;
  resetSessions: HandleResetSessionsType;
  deleteSession: DateTimeHandleDeleteType;
  danger?: boolean;
}) => {
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const handleCheckBox = () => {
    setIsRecurring(!isRecurring);
  };

  const [sessions, setSessions] = useState<Array<SessionType>>([]);

  const handleSetSessions: DateTimeHandleChangeType = (type, count, value) => {
    console.log({ type, count, value });

    let sessionToUpdate = sessions[count];

    switch (type) {
      case "dateTime": {
        // @help converting value to string only to satisfy ts error
        // `value` can either be number (for duration) or Date (for dateTime)
        const dateTime = new Date(value.toString());

        // new session, add to array
        if (!sessionToUpdate) {
          const updatedSessions = sessions.concat([
            {
              dateTime,
              duration: 1,
            },
          ]);
          handleChange(updatedSessions);
          return setSessions(updatedSessions);
        }

        // editing a session
        sessionToUpdate = Object.assign(sessionToUpdate, { dateTime });
        const updatedSessions = _.compact(
          sessions.map((s, index) => (index === count ? sessionToUpdate : s))
        );

        handleChange(updatedSessions);
        return setSessions(updatedSessions);
      }
      case "duration": {
        // @help converting value to string only to satisfy ts error
        // `value` can either be number (for duration) or Date (for dateTime)
        const duration = Number(value);

        // new session, add to array
        if (!sessionToUpdate) {
          const updatedSessions = sessions.concat([
            {
              dateTime: new Date(),
              duration: 1,
            },
          ]);
          handleChange(updatedSessions);
          return setSessions(updatedSessions);
        }

        // editing a session
        sessionToUpdate = Object.assign(sessionToUpdate, { duration });
        const updatedSessions = _.compact(
          sessions.map((s, index) => (index === count ? sessionToUpdate : s))
        );

        handleChange(updatedSessions);
        return setSessions(updatedSessions);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-10">
        <FieldLabel>Is this a recurring conversation?</FieldLabel>
        <input
          type="checkbox"
          name="multisession"
          id="proposemultisession"
          className="
          cursor-pointer
          rounded-sm
          border-gray-300 p-2
          text-primary
          focus:border-2 focus:border-primary focus:ring-2 focus:ring-primary
        "
          onChange={handleCheckBox}
        />
      </div>
      <Session
        isRecurring={isRecurring}
        handleChange={handleSetSessions}
        resetSessions={resetSessions}
        deleteSession={deleteSession}
        danger={danger}
      />
    </div>
  );
};
export default SessionsInput;
