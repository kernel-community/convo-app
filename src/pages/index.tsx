import type {NextPage} from "next";
import Main from "src/layouts/Main";
import Link from "next/link";
const Home: NextPage = () => {
  return (
    <>
      <Main>
        <div className='
          lg:pl-64
          md:pl-12
          pl-12
        '>
          <div className="
              font-heading
              font-bold
              lg:text-7xl text-5xl
              text-primary
              lg:py-5
            ">
            Convo.
          </div>
          <div
            className="
                font-secondary
                text-lg
                text-kernel
                pt-12
              "
          >
            {/* Spark a thought,&nbsp; */}
            <Link href='/propose'>
              <span className='before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-highlight relative inline-block cursor-pointer'>
                <span className='relative text-primary'>
                  <span className='underline decoration-dotted'>
                    Start a Convo
                  </span>.
                </span>
              </span>
            </Link>
            &nbsp;Make a Friend.
          </div>
        </div>
      </Main>
    </>
  );
};
export default Home;
