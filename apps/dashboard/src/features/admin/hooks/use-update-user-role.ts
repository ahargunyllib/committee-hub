import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/shared/lib/api";
import type { User, UserRole } from "@/shared/lib/types";

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ role, userId }: { role: UserRole; userId: string }) =>
      api.patch<User>(`/admin/users/${userId}/role`, { role }),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role updated");
    },
  });
}
