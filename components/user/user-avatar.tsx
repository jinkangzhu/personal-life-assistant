import { buildAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
} as const;

export function UserAvatar({
  user,
  size = "sm",
  className,
}: {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarKey?: string | null;
    updatedAt?: Date | string | number;
  };
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const displayName = user.displayName ?? user.email.split("@")[0];
  const initials = displayName.slice(0, 1).toUpperCase();
  const updatedAt =
    user.updatedAt instanceof Date
      ? user.updatedAt
      : user.updatedAt
        ? new Date(user.updatedAt)
        : new Date();

  if (user.avatarKey) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={buildAvatarUrl(user.id, updatedAt)}
        alt={displayName}
        className={cn(
          "rounded-full object-cover ring-1 ring-indigo-500/30",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-indigo-600/20 font-medium text-indigo-400 ring-1 ring-indigo-500/30",
        sizeClasses[size],
        className,
      )}
      aria-hidden={!!displayName}
    >
      {initials}
    </span>
  );
}
