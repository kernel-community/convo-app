import type { NextPage } from "next";
import Main from "src/layouts/Main";

const Profile: NextPage = () => {
  return (
    <>
      <Main>
        <div
          className="
          pl-6
          md:px-12
          lg:px-32
        "
        >
          <div
            className="
              font-heading
              text-5xl
              font-bold
              lowercase
              text-primary
              lg:py-5
            "
          >
            profile
          </div>
        </div>
      </Main>
    </>
  );
};

export default Profile;
