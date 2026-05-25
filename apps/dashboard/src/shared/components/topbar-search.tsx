import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/shared/components/ui/input";

export function TopbarSearch() {
  return (
    <div className="relative hidden md:block">
      <HugeiconsIcon
        className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        icon={Search01Icon}
      />
      <Input className="w-64 pl-9" placeholder="Search..." />
    </div>
  );
}
