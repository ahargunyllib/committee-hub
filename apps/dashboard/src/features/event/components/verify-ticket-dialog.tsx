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

import { useVerifyTicketForm } from "../hooks/use-verify-ticket-form";

type VerifyTicketDialogProps = {
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

export function VerifyTicketDialog({
  onOpenChange,
  open,
}: VerifyTicketDialogProps) {
  const { form, mutation } = useVerifyTicketForm(() => {
    onOpenChange(false);
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify ticket</DialogTitle>
          <DialogDescription>
            Codes look like CMTHB-XXXX-XXXX.
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
          <form.Field name="code">
            {(field) => {
              const error = formatErrors(field.state.meta.errors);
              return (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Ticket code</Label>
                  <Input
                    id={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value.toUpperCase());
                    }}
                    placeholder="CMTHB-XXXX-XXXX"
                    value={field.state.value}
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
              onClick={() => {
                onOpenChange(false);
              }}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              Verify
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
