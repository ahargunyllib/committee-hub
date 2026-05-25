import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/shared/lib/api";
import type { Division } from "@/shared/lib/types";

const createDivisionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quota: z.number().int().min(1, "Quota must be at least 1"),
  description: z.string(),
});

export type CreateDivisionInput = z.infer<typeof createDivisionSchema>;

function errorMessage(error: Error): string {
  return error.message || "Failed to create division";
}

export function useCreateDivisionForm(
  eventId: string | null | undefined,
  onSuccess?: (division: Division) => void
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateDivisionInput) =>
      api.post<Division>(`/committee/events/${eventId ?? ""}/divisions`, input),
    onSuccess: (division) => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      toast.success("Division created");
      onSuccess?.(division);
    },
    onError: (error: Error) => {
      toast.error(errorMessage(error));
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      quota: 1,
      description: "",
    } satisfies CreateDivisionInput,
    validators: {
      onChange: createDivisionSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return { form, mutation };
}
