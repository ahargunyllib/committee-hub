import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatRelative } from "@/shared/lib/format";
import type { SystemConfig } from "@/shared/lib/types";

import { ConfigEditDialog } from "./config-edit-dialog";

export function SystemConfigCard({ configs }: { configs: SystemConfig[] }) {
  const [editKey, setEditKey] = useState<string | null>(null);
  const editing = configs.find((config) => config.key === editKey) ?? null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System configuration</CardTitle>
        <Button
          onClick={() => {
            setEditKey("__new__");
          }}
          size="sm"
          type="button"
        >
          Add key
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.key}>
                <TableCell className="font-mono text-xs">
                  {config.key}
                </TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                    {config.value}
                  </code>
                </TableCell>
                <TableCell>{config.valueType}</TableCell>
                <TableCell className="text-muted-foreground">
                  {config.description ?? "-"}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground/60 text-xs">
                  {formatRelative(config.updatedAt)}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      setEditKey(config.key);
                    }}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <ConfigEditDialog
        existing={editKey === "__new__" ? null : editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditKey(null);
          }
        }}
        open={editKey !== null}
      />
    </Card>
  );
}
