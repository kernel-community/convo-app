import { Navbar } from "src/components/Navbar";
import { useRouter } from "next/router";
import Footer from "src/components/Footer";
import Image from "next/image";
import linesVector from "public/images/lines.png";
import type { ReactNode } from "react";

const linesBgOn = ["/"];

const Main = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { pathname } = useRouter();
  const displayLines = linesBgOn.find((path) => {
    if (path === "/") return pathname === path;
    return pathname.includes(path);
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden selection:bg-highlight selection:text-primary">
      <Navbar />
      <div
        className={`
          my-12
          flex-1
          sm:my-24
          ${className ?? ""}
      `}
      >
        {children}
      </div>
      <Footer />
      {displayLines && (
        <>
          <div
            className="
        hidden
        lg:absolute
        lg:-top-24
        lg:-left-52
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
        lg:-top-12
        lg:-right-52
        lg:z-0
        lg:block
        "
          >
            <Image src={linesVector} width={442} height={476} alt={""} />
          </div>
        </>
      )}
    </div>
  );
};

export default Main;
