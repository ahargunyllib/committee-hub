import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/shared/lib/api";
import type { CommitteeApplication } from "@/shared/lib/types";

const applyDivisionSchema = z.object({
  motivation: z.string().min(8, "Motivation must be at least 8 characters"),
});

export type ApplyDivisionInput = z.infer<typeof applyDivisionSchema>;

export function useApplyDivisionForm(
  divisionId: string,
  userId: string,
  onSuccess?: (application: CommitteeApplication) => void
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: ApplyDivisionInput) =>
      api.post<CommitteeApplication>(
        `/committee/divisions/${divisionId}/applications`,
        {
          userId,
          motivation: input.motivation,
        }
      ),
    onSuccess: (application) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application sent");
      onSuccess?.(application);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send application");
    },
  });

  const form = useForm({
    defaultValues: {
      motivation: "",
    } satisfies ApplyDivisionInput,
    validators: {
      onChange: applyDivisionSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return { form, mutation };
}
