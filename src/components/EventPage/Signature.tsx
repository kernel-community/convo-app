const Signature = ({ sign }: { sign: string | null }) => {
  return (
    <div className="pt-4 font-fancy text-4xl text-kernel md:text-5xl">
      {sign}
    </div>
  );
};

export default Signature;
