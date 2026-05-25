import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

import { useCreateEventForm } from "../hooks/use-create-event-form";

type CreateEventDialogProps = {
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

export function CreateEventDialog({
  onOpenChange,
  open,
}: CreateEventDialogProps) {
  const { form, mutation } = useCreateEventForm(() => {
    onOpenChange(false);
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
          <DialogDescription>
            Event will be created as a draft before it opens.
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
          <form.Field name="name">
            {(field) => (
              <FieldItem
                error={formatErrors(field.state.meta.errors)}
                label="Name"
              >
                <Input
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                  placeholder="Campus expo"
                  value={field.state.value}
                />
              </FieldItem>
            )}
          </form.Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="date">
              {(field) => (
                <FieldItem
                  error={formatErrors(field.state.meta.errors)}
                  label="Date"
                >
                  <Input
                    id={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                    }}
                    type="date"
                    value={field.state.value}
                  />
                </FieldItem>
              )}
            </form.Field>
            <form.Field name="quota">
              {(field) => (
                <FieldItem
                  error={formatErrors(field.state.meta.errors)}
                  label="Quota"
                >
                  <Input
                    id={field.name}
                    min={1}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(Number(event.target.value));
                    }}
                    type="number"
                    value={field.state.value}
                  />
                </FieldItem>
              )}
            </form.Field>
          </div>
          <form.Field name="location">
            {(field) => (
              <FieldItem
                error={formatErrors(field.state.meta.errors)}
                label="Location"
              >
                <Input
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                  placeholder="Auditorium"
                  value={field.state.value}
                />
              </FieldItem>
            )}
          </form.Field>
          <form.Field name="type">
            {(field) => (
              <FieldItem
                error={formatErrors(field.state.meta.errors)}
                label="Type"
              >
                <Select
                  onValueChange={(value: "internal" | "external") => {
                    field.handleChange(value);
                  }}
                  value={field.state.value}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
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
                  placeholder="Brief event summary"
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
              Create as draft
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
