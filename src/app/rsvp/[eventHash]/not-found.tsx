import Link from "next/link";
import Main from "src/layouts/Main";
import IdkImage from "public/images/idk.png";
import Image from "next/image";

export default function NotFound() {
  return (
    <Main className="justify-center px-6 lg:px-52">
      <div className="flex flex-col items-center text-center sm:flex-row">
        <div className="flex flex-col items-center">
          <Image src={IdkImage} alt="404" width={200} height={200} />
          <div className="text-xs text-gray-500 sm:text-sm">
            um, idk what ya lookin for
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="mb-4 text-3xl font-bold">Convo not found</h2>
          <p className="mb-8 text-gray-600">
            The Convo you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/"
            className="text-primary underline hover:text-primary-dark"
          >
            Return Home?
          </Link>
        </div>
      </div>
    </Main>
  );
}
