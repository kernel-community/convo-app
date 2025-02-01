import { useMediaQuery } from "src/hooks/useMediaQuery";
import { Dialog, DialogContent } from "./dialog";
import { Drawer, DrawerContent } from "./drawer";
import { cn } from "src/lib/utils";

interface ResponsiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveSheet({
  open,
  onOpenChange,
  children,
  className,
}: ResponsiveSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("sm:max-w-[600px]", className)}>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn("px-4 pb-8", className)}>
        <div className="overflow-y-auto">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
