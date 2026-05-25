import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/shared/lib/api";
import { useSession } from "@/shared/lib/auth";
import type { Proposal, ProposalScope } from "@/shared/lib/types";

const createProposalSchema = z.object({
  description: z.string(),
  documentUrl: z
    .string()
    .refine((value) => !value || URL.canParse(value), "Must be a valid URL"),
  eventId: z.string().min(1, "Event is required"),
  scope: z.enum(["ormawa", "fakultas", "universitas"]),
  title: z.string().min(1, "Title is required"),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;

export function useCreateProposalForm(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const mutation = useMutation({
    mutationFn: (value: CreateProposalInput) =>
      api.post<Proposal>("/proposals", {
        ...value,
        documentUrl: value.documentUrl || undefined,
        submittedById: session?.user.id,
      }),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit proposal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposal submitted");
      onSuccess?.();
    },
  });

  const defaultValues: CreateProposalInput = {
    description: "",
    documentUrl: "",
    eventId: "",
    scope: "ormawa" satisfies ProposalScope,
    title: "",
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
    validators: { onChange: createProposalSchema },
  });

  return { form, mutation };
}
