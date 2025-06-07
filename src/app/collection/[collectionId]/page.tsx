"use client";

import React from "react";
import Main from "src/layouts/Main";
import useCollection from "src/hooks/useCollection";
import { Events } from "src/components/Events";
import TitleLoadingState from "src/components/LoadingState/Title";

const Post = ({ params }: { params: Promise<{ collectionId: string }> }) => {
  const [collectionId, setCollectionId] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(({ collectionId }) => {
      setCollectionId(collectionId);
    });
  }, [params]);
  const {
    isLoading: isCollectionLoading,
    isError,
    data: collection,
  } = useCollection({ collectionId: collectionId || undefined });

  return (
    <Main>
      <div></div>
      <div
        className="
              dark:text-primary-dark
              font-primary
              text-5xl
              font-semibold
              lowercase text-primary
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
