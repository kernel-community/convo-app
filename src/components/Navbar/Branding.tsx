import kernelIcon from "public/images/kernel-small.png";
import Image from "next/image";
import Link from "next/link";
export const Branding = () => {
  return (
    <Link href="/">
      <div className={`
        flex flex-row items-center gap-3 py-5
        cursor-pointer uppercase
        `}>
        <Image
          src={kernelIcon}
          width={24}
          height={24} alt={""}
        />
          kernel
      </div>
    </Link>
  );
};
