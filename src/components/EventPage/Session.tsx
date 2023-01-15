import { isPast } from "src/utils/dateTime";
import Image from "next/image";
import cross from "public/vectors/cross.png";

const Session = ({
  handleClick,
  data,
  date,
  time,
  availableSeats,
  totalSeats,
  noLimit,
  isChecked,
  startDateTime,
}: {
  handleClick: (id: string, checked: boolean) => void;
  data: string;
  date: string;
  time: string;
  availableSeats?: number;
  totalSeats?: number;
  noLimit?: boolean;
  isChecked: boolean;
  startDateTime: string;
}) => {
  const active =
    (noLimit && !isPast(startDateTime)) ||
    (availableSeats && availableSeats > 0 && !isPast(startDateTime));
  return (
    <label
      className={`
        ${
          active
            ? `
            cursor-pointer
          `
            : "cursor-not-allowed"
        }
        justify-left flex flex-row items-center
        gap-1
      `}
    >
      {active && (
        <input
          onChange={(e) => handleClick(data, e.target.checked)}
          disabled={!active}
          type="checkbox"
          className={`
          mr-4 cursor-pointer
          rounded-md border-gray-300
          text-primary
          focus:border-2 focus:border-primary focus:ring-2 focus:ring-primary
        `}
          defaultChecked={isChecked}
        />
      )}
      {!active && (
        <div className="mr-4">
          <Image src={cross} width={18} height={17} alt="" />
        </div>
      )}
      <div
        className={`
        flex
        flex-1
        flex-row
        gap-4
        font-secondary
        ${active ? `text-primary` : `text-gray-400`}
        `}
      >
        <div>
          <div className="my-auto flex-1 text-left text-xs uppercase">
            {date}
          </div>
          <div className="my-auto flex-1 text-left text-xs uppercase">
            {time}
          </div>
        </div>
        {noLimit ? (
          <div className="my-auto mr-2 text-xs">No seat limit</div>
        ) : (
          <div
            className="
            my-auto mr-4 flex flex-col items-center
            gap-0 justify-self-end text-sm
          "
          >
            <div>
              {availableSeats}/{totalSeats}
            </div>
            <span className="text-xs">Seats Available</span>
          </div>
        )}
      </div>
    </label>
  );
};
export default Session;
