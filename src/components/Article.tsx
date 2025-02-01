export const Article = ({
  html,
  card,
}: {
  html: string | undefined | null;
  card?: boolean;
}) => {
  const createMarkup = () => {
    return {
      __html: html ? html : "",
    };
  };
  if (card) {
    return (
      <article className={`font-primary`}>
        <div dangerouslySetInnerHTML={createMarkup()}></div>
      </article>
    );
  }
  return (
    <article
      className={`
          prose
          prose-xl
          w-full
          max-w-none
          font-primary
          dark:prose-invert
        `}
    >
      <div dangerouslySetInnerHTML={createMarkup()}></div>
    </article>
  );
};
