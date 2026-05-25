import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/shared/lib/api";
import type { Event } from "@/shared/lib/types";

import { useCreateProposalForm } from "../hooks/use-create-proposal-form";

type CreateProposalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatErrors(errors: unknown[]): string | null {
  if (errors.length === 0) {
    return null;
  }
  return errors
    .map((error) => (error instanceof Error ? error.message : String(error)))
    .join(", ");
}

export function CreateProposalDialog({
  onOpenChange,
  open,
}: CreateProposalDialogProps) {
  const eventsQuery = useQuery({
    queryFn: () => api.get<Event[]>("/events"),
    queryKey: ["events", "list"],
  });
  const { form, mutation } = useCreateProposalForm(() => {
    onOpenChange(false);
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit proposal</DialogTitle>
          <DialogDescription>
            The scope determines the approval chain.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="eventId">
            {(field) => (
              <FieldItem
                error={formatErrors(field.state.meta.errors)}
                label="Event"
              >
                <Select
                  onValueChange={field.handleChange}
                  value={field.state.value}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="Choose event" />
                  </SelectTrigger>
                  <SelectContent>
                    {(eventsQuery.data ?? []).map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldItem>
            )}
          </form.Field>
          <form.Field name="title">
            {(field) => (
              <FieldItem
                error={formatErrors(field.state.meta.errors)}
                label="Title"
              >
                <Input
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                  value={field.state.value}
                />
              </FieldItem>
            )}
          </form.Field>
          <form.Field name="scope">
            {(field) => (
              <FieldItem
                error={formatErrors(field.state.meta.errors)}
                label="Scope"
              >
                <Select
                  onValueChange={(
                    value: "ormawa" | "fakultas" | "universitas"
                  ) => {
                    field.handleChange(value);
                  }}
                  value={field.state.value}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ormawa">Ormawa</SelectItem>
                    <SelectItem value="fakultas">Fakultas</SelectItem>
                    <SelectItem value="universitas">Universitas</SelectItem>
                  </SelectContent>
                </Select>
              </FieldItem>
            )}
          </form.Field>
          <form.Field name="documentUrl">
            {(field) => (
              <FieldItem
                error={formatErrors(field.state.meta.errors)}
                label="Document URL"
              >
                <Input
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                  placeholder="https://..."
                  value={field.state.value ?? ""}
                />
              </FieldItem>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <FieldItem
                error={formatErrors(field.state.meta.errors)}
                label="Description"
              >
                <Textarea
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                  value={field.state.value ?? ""}
                />
              </FieldItem>
            )}
          </form.Field>
          <DialogFooter>
            <Button
              onClick={() => {
                onOpenChange(false);
              }}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              Submit proposal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldItem({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error: string | null;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
