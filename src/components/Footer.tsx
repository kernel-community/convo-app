const Footer = () => {
  return (
    <div
      className={`
    w-full
    bg-kernel py-5
    font-secondary
    text-primary-muted dark:text-primary-dark
    `}
    >
      <div className="flex flex-row items-center justify-center">
        <span className="lowercase">
          Built at{" "}
          <a
            href="https://kernel.community/"
            target="_blank"
            rel="noopener noreferrer"
            className="normal-case text-secondary"
          >
            Kernel
          </a>
        </span>
      </div>
      {/* <div className="text-xs flex flex-row gap-3 justify-center italic font-primary font-thin px-4">
        <span>
          If this looks like something you&apos;d like to work on (we need tons of help)&nbsp;
          <a href="mailto:angela@kernel.community" className="underline">
          please get in touch!
          </a>
        </span>
      </div> */}
    </div>
  );
};

export default Footer;
