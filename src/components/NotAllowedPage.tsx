import Main from "src/layouts/Main";

export const NotAllowedPage = ({ message }: { message?: string }) => {
  return (
    <>
      <Main>
        <div className="flex flex-col items-center justify-center">
          <div
            className="
          mx-auto
          font-heading
          text-5xl
          font-extrabold
          text-primary dark:text-primary-dark
          sm:text-5xl
        "
          >
            Invalid request.
          </div>
          <div>{message}</div>
        </div>
      </Main>
    </>
  );
};

export default NotAllowedPage;
