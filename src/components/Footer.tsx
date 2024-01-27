const Footer = () => {
  return (
    <div
      className={`
    w-full
    bg-kernel py-5
    font-secondary
    text-primary-muted
    `}
    >
      <div className="flex flex-row items-center justify-center">
        <span className="lowercase">
          Built at&nbsp;
          <a
            href="https://kernel.community/"
            target="_blank"
            rel="noopener noreferrer"
            className="uppercase text-secondary"
          >
            Kernel
          </a>
        </span>
      </div>
      <div className="inset-0 flex select-none items-center justify-center ">
        <div className="max-w-sm text-center">
          <ul className="mt-4 flex items-center justify-center space-x-2">
            <li className="flex items-center space-x-2 rounded-md bg-gray-700 px-3 py-2 text-sm">
              <span>Reactions</span>
              <span className="rounded block border border-gray-400 px-1 text-xs font-medium uppercase text-gray-300">
                E
              </span>
            </li>

            <li className="flex items-center space-x-2 rounded-md bg-gray-700 px-3 py-2 text-sm">
              <span>Chat</span>
              <span className="rounded block border border-gray-400 px-1 text-xs font-medium uppercase text-gray-300">
                /
              </span>
            </li>

            <li className="flex items-center space-x-2 rounded-md bg-gray-700 px-3 py-2 text-sm">
              <span>Escape</span>
              <span className="rounded block border border-gray-400 px-1 text-xs font-medium uppercase text-gray-300">
                esc
              </span>
            </li>
          </ul>
        </div>
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
