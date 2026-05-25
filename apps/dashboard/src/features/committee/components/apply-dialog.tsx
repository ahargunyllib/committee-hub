import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useApplyDivisionForm } from "../hooks/use-apply-division-form";

type ApplyDialogProps = {
  divisionId: string;
  userId: string;
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

export function ApplyDialog({
  divisionId,
  userId,
  open,
  onOpenChange,
}: ApplyDialogProps) {
  const { form, mutation } = useApplyDivisionForm(divisionId, userId, () => {
    onOpenChange(false);
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to division</DialogTitle>
          <DialogDescription>
            Share why you want to join this committee division.
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
          <form.Field name="motivation">
            {(field) => {
              const error = formatErrors(field.state.meta.errors);

              return (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Motivation</Label>
                  <Textarea
                    id={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                    }}
                    placeholder="Tell the event lead what you can contribute."
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
              disabled={mutation.isPending}
              onClick={() => {
                onOpenChange(false);
              }}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={mutation.isPending} type="submit">
              Submit application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
