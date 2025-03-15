import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedTextArea } from "../../components/AnimatedTextArea";

type DateTimeRange = {
  start: string;
  end: string;
};

type ConvoInputAreaProps = {
  showTextArea: boolean;
  showForm: boolean;
  text: string;
  setText: (text: string) => void;
  setShowForm: (show: boolean) => void;
  setGeneratedTitle: (title: string) => void;
  setDateTimeStartAndEnd: (dateTime: DateTimeRange | null) => void;
};

export const ConvoInputArea: React.FC<ConvoInputAreaProps> = ({
  showTextArea,
  showForm,
  text,
  setText,
  setShowForm,
  setGeneratedTitle,
  setDateTimeStartAndEnd,
}) => (
  <AnimatePresence mode="wait">
    {showTextArea && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
          className="mb-2"
        >
          Describe your convo, including date & time, & what you hope it to feel
          like...
        </motion.div>
        <AnimatedTextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onClick={() => {
            if (showForm) {
              // Reset form state when clicking the collapsed textarea
              setShowForm(false);
              setGeneratedTitle("");
              setDateTimeStartAndEnd(null);
            }
          }}
          className={`w-full resize-none rounded-lg border p-6 focus:outline-none ${
            showForm ? "border-4 border-muted" : ""
          }`}
          isCollapsed={showForm}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConvoInputArea;
