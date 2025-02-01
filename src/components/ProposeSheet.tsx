import { useState } from "react";
import { Button } from "./ui/button";
import { ResponsiveSheet } from "./ui/responsive-sheet";
import ProposeForm from "./ProposeForm";
import { Plus } from "lucide-react";

interface ProposeSheetProps {
  className?: string;
}

export function ProposeSheet({ className }: ProposeSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className={className} size="lg">
        <Plus className="mr-2 h-4 w-4" />
        Create Convo
      </Button>
      <ResponsiveSheet
        open={open}
        onOpenChange={setOpen}
        className="max-h-[85vh] overflow-y-auto"
      >
        <div className="py-4">
          <ProposeForm />
        </div>
      </ResponsiveSheet>
    </>
  );
}
