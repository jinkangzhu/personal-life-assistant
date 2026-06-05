import { cn } from "@/lib/utils";

export function FormError({
  message,
  size = "default",
  className,
}: {
  message?: string;
  size?: "default" | "sm";
  className?: string;
}) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={cn(
        "text-red-400",
        size === "sm" ? "text-xs" : "text-sm",
        className,
      )}
    >
      {message}
    </p>
  );
}

export function FormSuccess({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;

  return (
    <p role="status" className={cn("text-sm text-emerald-400", className)}>
      {message}
    </p>
  );
}
