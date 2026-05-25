import type { ComponentProps, ReactNode } from "react";

import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

function Form({ className, ...props }: ComponentProps<"form">) {
  return <form className={cn("space-y-4", className)} {...props} />;
}

function FormItem({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

function FormLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return <Label className={cn(className)} {...props} />;
}

function FormDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-xs", className)} {...props} />
  );
}

function FormMessage({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  if (!children) {
    return null;
  }

  return (
    <p className={cn("text-destructive text-xs", className)}>{children}</p>
  );
}

export { Form, FormDescription, FormItem, FormLabel, FormMessage };
