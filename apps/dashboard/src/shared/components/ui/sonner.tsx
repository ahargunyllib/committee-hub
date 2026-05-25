import { Toaster as Sonner, type ToasterProps } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  MultiplicationSignCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    className="toaster group"
    icons={{
      success: (
        <HugeiconsIcon
          className="size-4"
          icon={CheckmarkCircle02Icon}
          strokeWidth={2}
        />
      ),
      info: (
        <HugeiconsIcon
          className="size-4"
          icon={InformationCircleIcon}
          strokeWidth={2}
        />
      ),
      warning: (
        <HugeiconsIcon className="size-4" icon={Alert02Icon} strokeWidth={2} />
      ),
      error: (
        <HugeiconsIcon
          className="size-4"
          icon={MultiplicationSignCircleIcon}
          strokeWidth={2}
        />
      ),
      loading: (
        <HugeiconsIcon
          className="size-4 animate-spin"
          icon={Loading03Icon}
          strokeWidth={2}
        />
      ),
    }}
    style={
      {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      } as React.CSSProperties
    }
    theme="system"
    toastOptions={{
      classNames: {
        toast: "cn-toast",
      },
    }}
    {...props}
  />
);

export { Toaster };
