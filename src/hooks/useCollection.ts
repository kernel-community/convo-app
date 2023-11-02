// given a id
// fetch collection details
import { useQuery } from "react-query";
import type { FullCollection } from "src/types";

const useCollection = ({
  collectionId,
}: {
  collectionId?: string | string[];
}) => {
  const { isLoading, isError, data, refetch } = useQuery(
    `collection_${collectionId}`,
    async () => {
      try {
        const r = (
          await (
            await fetch("/api/query/collection", {
              body: JSON.stringify({ collectionId }),
              method: "POST",
              headers: { "Content-type": "application/json" },
            })
          ).json()
        ).data;
        return r;
      } catch (err) {
        throw err;
      }
    },
    {
      refetchInterval: 60000,
      enabled: !!collectionId,
    }
  );

  return {
    isLoading,
    isError,
    data: data as FullCollection,
    refetch,
  };
};

export default useCollection;
