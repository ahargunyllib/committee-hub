import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/shared/lib/api";
import type {
  ApplicationStatus,
  CommitteeApplication,
} from "@/shared/lib/types";

type ReviewApplicationInput = {
  applicationId: string;
  status: Extract<ApplicationStatus, "accepted" | "rejected">;
};

export function useReviewApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, status }: ReviewApplicationInput) =>
      api.patch<CommitteeApplication>(
        `/committee/applications/${applicationId}/review`,
        { status }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      toast.success("Application reviewed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to review application");
    },
  });
}
