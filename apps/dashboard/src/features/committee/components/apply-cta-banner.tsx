import { useState } from "react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

import { ApplyDialog } from "./apply-dialog";

type ApplyCtaBannerProps = {
  divisionId: string;
  divisionName: string;
  userId: string;
  disabled?: boolean;
};

export function ApplyCtaBanner({
  divisionId,
  divisionName,
  userId,
  disabled,
}: ApplyCtaBannerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-md border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-medium">Apply to {divisionName}</h3>
        <p className="mt-1 text-muted-foreground text-xs">
          Submit a short motivation for the event lead to review.
        </p>
      </div>
      <Button
        disabled={disabled}
        onClick={() => {
          setOpen(true);
        }}
        type="button"
      >
        <HugeiconsIcon icon={PlusSignIcon} />
        {disabled ? "Division full" : "Apply"}
      </Button>
      <ApplyDialog
        divisionId={divisionId}
        onOpenChange={setOpen}
        open={open}
        userId={userId}
      />
    </div>
  );
}
