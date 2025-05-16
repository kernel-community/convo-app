import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DateTime } from "luxon";
import ProposeForm from "src/components/ProposeForm";
import { X } from "lucide-react";

type DateTimeRange = {
  start: string;
  end: string;
};

type EventFormSectionProps = {
  showForm: boolean;
  formRef: React.RefObject<HTMLDivElement>;
  generatedDescription: string;
  text: string;
  generatedTitle: string;
  dateTimeStartAndEnd: DateTimeRange | null;
  generatedLocation: string | null;
  setShowForm?: (show: boolean) => void;
};

export const EventFormSection: React.FC<EventFormSectionProps> = ({
  showForm,
  formRef,
  generatedDescription,
  text,
  generatedTitle,
  dateTimeStartAndEnd,
  generatedLocation,
  setShowForm,
}) => (
  <AnimatePresence mode="wait">
    {showForm && (
      <motion.div
        ref={formRef}
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{
          opacity: 1,
          y: 0,
          height: "auto",
          transition: {
            height: { duration: 0.3 },
            opacity: { duration: 0.3, delay: 0.1 },
          },
        }}
        exit={{
          opacity: 0,
          y: 20,
          height: 0,
          transition: {
            height: { duration: 0.3, delay: 0.1 },
            opacity: { duration: 0.2 },
          },
        }}
        className="relative mt-8 overflow-visible"
      >
        {setShowForm && (
          <button
            onClick={() => setShowForm(false)}
            className="absolute right-0 top-0 z-10 rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Close form"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
        <div className="mt-8">
          <ProposeForm
            event={{
              description: generatedDescription || text,
              title: generatedTitle || text.split("\n")[0] || "",
              dateTimeStartAndEnd: dateTimeStartAndEnd
                ? {
                    start: new Date(dateTimeStartAndEnd.start),
                    end: new Date(dateTimeStartAndEnd.end),
                  }
                : {
                    start: DateTime.now()
                      .plus({ hours: 1 })
                      .startOf("hour")
                      .toJSDate(),
                    end: DateTime.now()
                      .plus({ hours: 2 })
                      .startOf("hour")
                      .toJSDate(),
                  },
              limit: "0",
              location: generatedLocation || "Somewhere Online",
              nickname: "Anonymous",
              gCalEvent: true,
              type: "JUNTO",
              sessions: [
                {
                  dateTime: dateTimeStartAndEnd
                    ? new Date(dateTimeStartAndEnd.start)
                    : DateTime.now().startOf("hour").toJSDate(),
                  duration: 1,
                  count: 1,
                },
              ],
              recurrenceRule: undefined,
            }}
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default EventFormSection;
