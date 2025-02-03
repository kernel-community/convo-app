import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerPortal } from "./ui/drawer";
import ProposeForm from "./ProposeForm";
import { Plus } from "lucide-react";
import { useMediaQuery } from "src/hooks/useMediaQuery";

interface ProposeSheetProps {
  className?: string;
}

export function ProposeSheet({ className }: ProposeSheetProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      <Button onClick={() => setOpen(true)} className={className} size="lg">
        <Plus className="mr-2 h-4 w-4" />
        Create Convo
      </Button>

      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
            <div className="py-4">
              <ProposeForm showRecurrenceInput={false} />
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          open={open}
          onOpenChange={setOpen}
          shouldScaleBackground
          dismissible
          snapPoints={[1]}
          activeSnapPoint={0}
          modal={true}
        >
          <DrawerContent className="pointer-events-auto h-[85vh] px-4 pb-8">
            <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
            <div className="pointer-events-auto mt-6 h-[calc(85vh-6rem)] overflow-y-auto">
              <ProposeForm showRecurrenceInput={false} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
