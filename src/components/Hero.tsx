import { InfoBox } from "./InfoBox";

const Hero = ({
  title,
  isImported,
  isDeleted,
}: {
  title?: string;
  isImported?: boolean;
  isDeleted?: boolean;
}) => {
  return (
    <div className="flex flex-col justify-items-start">
      <div
        className="
          py-5
          font-heading
          text-3xl
          font-bold
          text-primary dark:text-primary-dark
          lg:text-4xl
          xl:text-5xl
        "
      >
        {title}
      </div>
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
