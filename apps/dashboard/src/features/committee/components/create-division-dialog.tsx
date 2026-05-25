import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Division } from "@/shared/lib/types";

import { useCreateDivisionForm } from "../hooks/use-create-division-form";

type CreateDivisionDialogProps = {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (division: Division) => void;
};

function formatErrors(errors: unknown[]): string | null {
  if (errors.length === 0) {
    return null;
  }
  return errors
    .map((error) => (error instanceof Error ? error.message : String(error)))
    .join(", ");
}

export function CreateDivisionDialog({
  eventId,
  open,
  onOpenChange,
  onCreated,
}: CreateDivisionDialogProps) {
  const { form, mutation } = useCreateDivisionForm(eventId, (division) => {
    onCreated?.(division);
    onOpenChange(false);
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create division</DialogTitle>
          <DialogDescription>
            Add a committee division with a quota and optional description.
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
            {(field) => {
              const error = formatErrors(field.state.meta.errors);

              return (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                    }}
                    placeholder="Acara"
                    value={field.state.value}
                  />
                  {error ? (
                    <p className="text-destructive text-xs">{error}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="quota">
            {(field) => {
              const error = formatErrors(field.state.meta.errors);

              return (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Quota</Label>
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
                  {error ? (
                    <p className="text-destructive text-xs">{error}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>
          <form.Field name="description">
            {(field) => {
              const error = formatErrors(field.state.meta.errors);

              return (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Description</Label>
                  <Textarea
                    id={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                    }}
                    placeholder="What this division owns."
                    value={field.state.value ?? ""}
                  />
                  {error ? (
                    <p className="text-destructive text-xs">{error}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>
          <DialogFooter>
            <Button
              disabled={mutation.isPending}
              onClick={() => {
                onOpenChange(false);
              }}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={!eventId || mutation.isPending} type="submit">
              Create division
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
