import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
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
import type { ConfigValueType, SystemConfig } from "@/shared/lib/types";

import { useUpsertConfig } from "../hooks/use-upsert-config";
import { validateConfigValue } from "../utils/value-type-validator";

type ConfigEditDialogProps = {
  existing: SystemConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const valueTypes: ConfigValueType[] = ["string", "number", "boolean", "json"];

export function ConfigEditDialog({
  existing,
  onOpenChange,
  open,
}: ConfigEditDialogProps) {
  const [keyName, setKeyName] = useState("");
  const [value, setValue] = useState("");
  const [valueType, setValueType] = useState<ConfigValueType>("string");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const mutation = useUpsertConfig(() => {
    onOpenChange(false);
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    setKeyName(existing?.key ?? "");
    setValue(existing?.value ?? "");
    setValueType(existing?.valueType ?? "string");
    setDescription(existing?.description ?? "");
    setError(null);
  }, [existing, open]);

  const handleSubmit = () => {
    const validation = validateConfigValue(value, valueType);
    if (validation) {
      setError(validation);
      return;
    }
    if (!keyName.trim()) {
      setError("Key is required");
      return;
    }
    mutation.mutate({
      description,
      key: keyName.trim(),
      value,
      valueType,
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Edit config" : "Add config"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="config-key">Key</Label>
            <Input
              disabled={!!existing}
              id="config-key"
              onChange={(event) => {
                setKeyName(event.target.value);
              }}
              value={keyName}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="config-type">Type</Label>
            <Select
              onValueChange={(nextType: ConfigValueType) => {
                setValueType(nextType);
              }}
              value={valueType}
            >
              <SelectTrigger id="config-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {valueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="config-value">Value</Label>
            <Input
              id="config-value"
              onChange={(event) => {
                setValue(event.target.value);
              }}
              value={value}
            />
            {error ? <p className="text-destructive text-xs">{error}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="config-description">Description</Label>
            <Textarea
              id="config-description"
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              value={description}
            />
          </div>
        </div>
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
          <Button
            disabled={mutation.isPending}
            onClick={handleSubmit}
            type="button"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
