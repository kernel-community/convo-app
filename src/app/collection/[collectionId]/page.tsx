"use client";

import Main from "src/layouts/Main";
import useCollection from "src/hooks/useCollection";
import { Events } from "src/components/Events";
import TitleLoadingState from "src/components/LoadingState/Title";

const Post = ({ params }: { params: { collectionId: string } }) => {
  const collectionId = params.collectionId;
  const {
    isLoading: isCollectionLoading,
    isError,
    data: collection,
  } = useCollection({ collectionId });

  return (
    <Main className="px-6 sm:px-24">
      <div></div>
      <div
        className="
              font-heading
              text-5xl
              font-bold
              lowercase
              text-primary dark:text-primary-dark
              lg:py-5
            "
      >
        {isCollectionLoading ? <TitleLoadingState thicc /> : collection?.name}
        <div className="pt-2 font-primary text-base font-thin normal-case italic">
          {isCollectionLoading ? (
            <TitleLoadingState />
          ) : (
            <>
              This is a collection of Convos curated by{" "}
              <span className="text-kernel-light">
                {collection?.user.nickname}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="mt-8">
        {isCollectionLoading && (
          <div>
            <TitleLoadingState thicc />
          </div>
        )}
        {collection && (
          <Events
            type="collection"
            preFilterObject={{
              collection: { id: collection.id, when: "upcoming" },
            }}
            infinite={false}
            take={100}
            title="upcoming"
          />
        )}
      </div>
      <div className="mt-16">
        {collection && (
          <Events
            type="collection"
            preFilterObject={{
              collection: { id: collection.id, when: "past" },
            }}
            take={100}
            infinite={false}
            title="past"
          />
        )}
      </div>
    </Main>
  );
};

export default Post;
