import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  isProposalScopeFilter,
  isProposalStatusFilter,
  useProposalsFilterStore,
} from "../stores/use-proposals-filter-store";

export function ProposalsFilterBar() {
  const { filter, setScope, setSearch, setStatus } = useProposalsFilterStore();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative w-full sm:w-80">
        <HugeiconsIcon
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          icon={Search01Icon}
        />
        <Input
          className="pl-9"
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Search proposals..."
          value={filter.search}
        />
      </div>
      <ToggleGroup
        onValueChange={(value) => {
          if (isProposalStatusFilter(value)) {
            setStatus(value);
          }
        }}
        type="single"
        value={filter.status}
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="pending">Pending</ToggleGroupItem>
        <ToggleGroupItem value="revision_requested">Revision</ToggleGroupItem>
        <ToggleGroupItem value="approved">Approved</ToggleGroupItem>
        <ToggleGroupItem value="rejected">Rejected</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        onValueChange={(value) => {
          if (isProposalScopeFilter(value)) {
            setScope(value);
          }
        }}
        type="single"
        value={filter.scope}
      >
        <ToggleGroupItem value="all">All scopes</ToggleGroupItem>
        <ToggleGroupItem value="ormawa">Ormawa</ToggleGroupItem>
        <ToggleGroupItem value="fakultas">Fakultas</ToggleGroupItem>
        <ToggleGroupItem value="universitas">Universitas</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
