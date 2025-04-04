import Link from "next/link";
import Main from "src/layouts/Main";
import Quotes from "src/components/quotes";

export default function NotFound() {
  return (
    <Main className="self-center px-6 lg:px-52">
      <div className="flex flex-col justify-start">
        <h2 className="mb-4 font-primary text-3xl font-bold">404</h2>
        <Quotes />
        <Link
          href="/"
          className="hover:text-primary-dark mt-5 font-secondary text-primary underline"
        >
          Return Home?
        </Link>
      </div>
    </Main>
  );
}
