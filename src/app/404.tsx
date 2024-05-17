import Main from "src/layouts/Main";

export const NotFoundPage = () => {
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
          text-primary
          sm:text-5xl
        "
          >
            404: Not found
          </div>
        </div>
      </Main>
    </>
  );
};

export default NotFoundPage;
