import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/shared/lib/api";
import type { Ticket } from "@/shared/lib/types";

const verifyTicketSchema = z.object({
  code: z.string().min(4, "Ticket code is required"),
});

type VerifyTicketInput = z.infer<typeof verifyTicketSchema>;

export function useVerifyTicketForm(onSuccess?: () => void) {
  const mutation = useMutation({
    mutationFn: (input: VerifyTicketInput) =>
      api.post<Ticket>(`/events/tickets/${input.code.trim()}/verify`),
    onError: (error: Error) => {
      toast.error(error.message || "Ticket verification failed");
    },
    onSuccess: (ticket) => {
      toast.success(`Ticket ${ticket.code} verified`);
      onSuccess?.();
    },
  });

  const form = useForm({
    defaultValues: {
      code: "",
    } satisfies VerifyTicketInput,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
    validators: { onChange: verifyTicketSchema },
  });

  return { form, mutation };
}
