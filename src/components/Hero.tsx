const Hero = ({ title }: { title?: string }) => {
  return (
    <div className="flex flex-col justify-items-start">
      <div
        className="
          py-5
          font-heading
          text-3xl
          font-bold
          text-primary
          lg:text-4xl
          xl:text-5xl
        "
      >
        {title}
      </div>
    </div>
  );
};

export default Hero;
