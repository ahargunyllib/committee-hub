import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@/shared/lib/api";
import { useSession } from "@/shared/lib/auth";
import type { Event, EventType } from "@/shared/lib/types";

const createEventSchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string(),
  location: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  quota: z.number().int().min(1, "Quota must be at least 1"),
  type: z.enum(["internal", "external"]),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export function useCreateEventForm(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const mutation = useMutation({
    mutationFn: (value: CreateEventInput) =>
      api.post<Event>("/events", {
        ...value,
        createdById: session?.user.id,
        date: new Date(value.date).toISOString(),
      }),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created as draft");
      onSuccess?.();
    },
  });

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 14);
  const defaultValues: CreateEventInput = {
    date: defaultDate.toISOString().slice(0, 10),
    description: "",
    location: "",
    name: "",
    quota: 1,
    type: "internal" satisfies EventType,
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
    validators: { onChange: createEventSchema },
  });

  return { form, mutation };
}
