import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/shared/lib/api";
import { useSession } from "@/shared/lib/auth";
import type { ConfigValueType, SystemConfig } from "@/shared/lib/types";

export type UpsertConfigInput = {
  description?: string;
  key: string;
  value: string;
  valueType: ConfigValueType;
};

export function useUpsertConfig(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (input: UpsertConfigInput) =>
      api.put<SystemConfig>(`/admin/config/${input.key}`, {
        description: input.description,
        updatedById: session?.user.id,
        value: input.value,
        valueType: input.valueType,
      }),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save config");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
      toast.success("Config saved");
      onSuccess?.();
    },
  });
}
