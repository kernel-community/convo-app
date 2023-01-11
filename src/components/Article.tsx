export const Article = ({ html }: { html: string | undefined | null }) => {
  const createMarkup = () => {
    return {
      __html: html ? html : "",
    };
  };
  return (
    <article
      className="
          prose
          font-primary
          sm:prose-lg
          md:prose-xl
        "
    >
      <div dangerouslySetInnerHTML={createMarkup()}></div>
    </article>
  );
};
