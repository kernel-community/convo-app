import type { NextPage } from "next";
import { useQuery } from "react-query";
import Button from "src/components/Button";
import Main from "src/layouts/Main";

const About: NextPage = () => {
  const { isLoading, isError, data, refetch } = useQuery(
    `test_google_auth`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/actions/google/getCalendar", {
              method: "POST",
              headers: { "Content-type": "application/json" },
            })
          ).json()
        ).data;
        return r;
      } catch (err) {
        throw err;
      }
    },
    {
      refetchInterval: 6000000000,
      enabled: false,
    }
  );

  const handleClick = () => refetch();

  console.log({ isLoading, isError, data });
  return (
    <>
      <Main className="mx-auto px-4">
        <div
          className="
          pl-6
          md:px-12
          lg:px-32
        "
        >
          <div className="flex flex-col items-center justify-center">
            <div
              className="
            mx-auto
            font-heading
            text-4xl
            font-extrabold
            text-primary
            sm:text-4xl
          "
            >
              <Button buttonText="Fetch Calendar" handleClick={handleClick} />
            </div>
          </div>
        </div>
      </Main>
    </>
  );
};

export default About;
