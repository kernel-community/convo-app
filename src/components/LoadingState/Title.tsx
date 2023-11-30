const TitleLoadingState = ({
  thicc = false, // hehehehe
}: {
  thicc?: boolean;
}) => {
  return (
    <div
      className={`relative isolate
        w-full
        overflow-hidden
        rounded-full shadow-xl
        shadow-kernel/5 before:border-t
        before:border-skin/30
        ${thicc ? "h-[2.5rem]" : "h-[1rem]"}
         bg-black/20
    `}
    >
      <div
        className="absolute h-full w-full -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-skin/5 via-skin/30 to-skin/5
    "
      ></div>
    </div>
  );
};

export default TitleLoadingState;
