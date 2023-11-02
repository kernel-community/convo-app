import { useRouter } from "next/router";
import Main from "src/layouts/Main";
import useCollection from "src/hooks/useCollection";
import { Events } from "src/components/Events";

const Post = () => {
  const { query } = useRouter();
  const { collectionId } = query;
  const {
    isLoading,
    isError,
    data: collection,
  } = useCollection({ collectionId });

  return (
    <Main className="px-6 sm:px-24">
      <div
        className="
              font-heading
              text-5xl
              font-bold
              lowercase
              text-primary
              lg:py-5
            "
      >
        {collection?.name}
        <div className="font-primary text-base font-thin normal-case italic">
          This is a collection of Convos curated by{" "}
          <span className="text-kernel-light">{collection?.user.nickname}</span>{" "}
        </div>
      </div>
      <div>
        {collection && (
          <Events
            type="collection"
            preFilterObject={{ collectionId: collection.id }}
            take={50}
          />
        )}
      </div>
    </Main>
  );
};

export default Post;
