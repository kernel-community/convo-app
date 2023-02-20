import type { NextPage } from "next";
import ProposeForm from "src/components/ProposeForm";
import Main from "src/layouts/Main";
const Home: NextPage = () => {
  return (
    <>
      <Main>
        <div className="flex flex-col items-center justify-center">
          <div
            className="
            mx-auto
            font-heading
            text-5xl
            font-extrabold
            text-primary
            sm:text-5xl
          "
          >
            Propose a Conversation
          </div>
          <div className="my-12 w-full border border-primary lg:w-9/12"></div>
        </div>
        <div className="lg:px-32">
          <ProposeForm />
        </div>
      </Main>
    </>
  );
};
export default Home;
