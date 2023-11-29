import { CardTemplate } from "./Card";

const EventLoadingState = () => {
  return (
    <CardTemplate>
      <div
        className="relative isolate h-full
        w-full
        overflow-hidden
        rounded-lg shadow-xl
        shadow-kernel/5 before:border-t
        before:border-skin/30
    "
      >
        <div
          className="absolute h-full w-full -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-skin/5 via-skin/30 to-skin/5
    "
        ></div>
        <div
          className="
        absolute h-full w-full space-y-5 rounded-2xl
        bg-secondary/5

      "
        >
          <div className=" h-1/2 rounded-lg bg-skin/10"></div>
          <div className="w-full space-y-3">
            <div className="h-3 w-3/5 rounded-lg bg-skin/10"></div>
            <div className="h-3 w-4/5 rounded-lg bg-skin/20"></div>
            <div className="h-3 w-2/5 rounded-lg bg-skin/30"></div>
          </div>
        </div>
      </div>
    </CardTemplate>
  );
};

export default EventLoadingState;
