const Hero = ({
  title,
  type,
  proposer,
}: {
  title?: string;
  type?: string;
  proposer?: string | null;
}) => {
  return (
    <div className="flex flex-col justify-items-start">
      <div
        className="
            font-secondary
            text-base
            uppercase text-kernel
            sm:text-lg
          "
      >
        {type}
      </div>
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
      <div className="font-secondary text-lg sm:text-xl">
        by&nbsp;{proposer || "Anonymous"}
      </div>
    </div>
  );
};

export default Hero;
