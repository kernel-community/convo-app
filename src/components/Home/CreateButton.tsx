import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "src/components/ui/button";
import { Command, CornerDownLeft } from "lucide-react";

type CreateButtonProps = {
  showForm: boolean;
  showTextArea: boolean;
  text: string;
  isLoading: boolean;
  handleCreateClick: () => void;
};

export const CreateButton: React.FC<CreateButtonProps> = ({
  showForm,
  showTextArea,
  text,
  isLoading,
  handleCreateClick,
}) => (
  <AnimatePresence mode="wait">
    {!showForm && (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="flex w-full justify-center"
      >
        <Button
          className={`w-1/3 rounded-br-[50px] rounded-tl-[50px] p-4 font-secondary text-lg hover:border-secondary sm:p-8 sm:text-2xl ${
            showTextArea ? (text.trim() ? "" : "bg-warn") : ""
          }`}
          onClick={handleCreateClick}
          isLoading={isLoading}
          variant="default"
        >
          <div className="flex items-center justify-center gap-2">
            <span>
              {showTextArea ? (text.trim() ? "Create" : "Cancel") : "Create"}
            </span>
            {showTextArea && text.trim() && (
              <div className="hidden items-center gap-1 opacity-50 sm:flex">
                <Command className="h-4 w-4" />
                <span>+</span>
                <CornerDownLeft className="h-4 w-4" />
              </div>
            )}
          </div>
        </Button>
      </motion.div>
    )}
  </AnimatePresence>
);

export default CreateButton;
