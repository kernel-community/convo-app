import type { Dispatch, SetStateAction } from "react";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
} from "src/components/ui/credenza";
import { Button } from "src/components/ui/button";
import { Skeleton } from "src/components/ui/skeleton";

const ConfirmDeleteCredenza = ({
  openModalFlag,
  setOpenModalFlag,
  action,
  isLoading,
}: {
  openModalFlag: boolean;
  setOpenModalFlag: Dispatch<SetStateAction<boolean>>;
  action: () => Promise<void>;
  isLoading: boolean;
}) => {
  return (
    <Credenza open={openModalFlag} onOpenChange={setOpenModalFlag}>
      <CredenzaContent>
        <CredenzaHeader>Confirm Deleting Convo</CredenzaHeader>
        <CredenzaBody className="flex h-full flex-col items-start overflow-auto">
          This action will delete the convo and mark it as `Cancelled` on google
          calendar
        </CredenzaBody>
        <CredenzaFooter>
          {isLoading ? (
            <Skeleton className="h-[40px] w-full rounded-lg bg-slate-400" />
          ) : (
            <Button onClick={() => action()} className="w-full">
              Delete
            </Button>
          )}
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default ConfirmDeleteCredenza;
