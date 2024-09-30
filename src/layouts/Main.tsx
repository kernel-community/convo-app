import { Navbar } from "src/components/Navbar";
import Footer from "src/components/Footer";
// import Image from "next/image";
// import linesVector from "public/images/lines.png";
import type { ReactNode } from "react";

const Main = ({
  children,
  className,
}: // linesOverride,
// showLines = false,
{
  children: ReactNode;
  className?: string;
  linesOverride?: boolean;
  showLines?: boolean;
}) => {
  // const { pathname } = useRouter();
  // const displayLines: boolean = linesOverride ? showLines : pathname === "/";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden selection:bg-highlight selection:text-primary dark:text-primary-dark">
      <Navbar />
      <div
        className={`
          my-12
          flex-1
          sm:my-24
          ${className}
      `}
      >
        {children}
      </div>
      <Footer />
      {/* {displayLines && (
        <>
          <div
            className="
        hidden
        lg:absolute
        lg:-left-52
        lg:-top-24
        lg:z-0
        lg:block
        "
          >
            <Image src={linesVector} width={383} height={412} alt={""} />
          </div>
          <div
            className="
        hidden
        lg:absolute
        lg:-right-52
        lg:-top-12
        lg:z-0
        lg:block
        "
          >
            <Image src={linesVector} width={442} height={476} alt={""} />
          </div>
        </>
      )} */}
    </div>
  );
};

export default Main;
