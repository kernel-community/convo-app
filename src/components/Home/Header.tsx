import React from "react";
import { FancyHighlight } from "../../components/FancyHighlight";
import { ScrambleText } from "../../components/ScrambleText";

type HeaderProps = {
  userStartedTyping: boolean;
  showTextArea: boolean;
  showForm: boolean;
};

export const Header: React.FC<HeaderProps> = ({
  userStartedTyping,
  showTextArea,
  showForm,
}) => (
  <div className="text-center">
    <div className="flex-inline flex flex-col gap-1 font-primary text-6xl sm:flex-row">
      <div>Start a</div>
      <FancyHighlight className="mx-2 inline-block font-brand">
        {userStartedTyping || !showTextArea || showForm ? (
          "Convo"
        ) : (
          <ScrambleText />
        )}
      </FancyHighlight>
    </div>
  </div>
);

export default Header;
