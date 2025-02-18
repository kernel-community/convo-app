import Main from "src/layouts/Main";

export const NotAllowedPage = ({ message }: { message?: string }) => {
  return (
    <>
      <Main>
        <div className="flex flex-col items-center justify-center">
          <div
            className="
          dark:text-primary-dark
          mx-auto
          font-primary
          text-5xl
          font-semibold text-primary
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
