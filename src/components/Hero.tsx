import { getDateTimeString } from "src/utils/dateTime";
import { InfoBox } from "./InfoBox";

const Hero = ({
  title,
  isImported,
  isDeleted,
  createdAt,
}: {
  title?: string;
  isImported?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
}) => {
  return (
    <div className="flex flex-col justify-items-start">
      <div
        className="
          py-5
          font-heading
          text-3xl
          font-bold
          text-primary
          lg:text-4xl
          xl:text-5xl
        "
      >
        {title}
      </div>
      {createdAt && (
        <div className="font-primary text-sm">
          scheduled on{" "}
          <span className="font-medium">
            {getDateTimeString(createdAt.toString(), "date")}
          </span>
        </div>
      )}
      {isImported && (
        <InfoBox type="warning">
          This event was imported. The number of RSVPs might not be correct.
        </InfoBox>
      )}
      {isDeleted && (
        <InfoBox type="error">
          This event has been canceled by the proposer.
        </InfoBox>
      )}
    </div>
  );
};

export default Hero;
