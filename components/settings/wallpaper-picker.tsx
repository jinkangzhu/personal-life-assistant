"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  removeWallpaperAction,
  updateWallpaperPreferenceAction,
  uploadWallpaperAction,
} from "@/app/(main)/settings/actions";
import { FormError } from "@/components/ui/form-error";
import { SettingsFieldHint } from "@/components/settings/settings-ui";
import { Button } from "@/components/ui/button";
import { buildWallpaperUrl } from "@/lib/wallpaper-image";
import {
  applyWallpaper,
  persistWallpaper,
  persistWallpaperSelection,
  readStoredWallpaperOverlay,
} from "@/lib/wallpaper";
import {
  DEFAULT_WALLPAPER_OVERLAY,
  MAX_WALLPAPER_OVERLAY,
  MIN_WALLPAPER_OVERLAY,
  WALLPAPER_BUILTIN_PRESETS,
  parseWallpaperPreference,
  type WallpaperPreference,
} from "@/lib/validators/settings";
import { cn } from "@/lib/utils";

const PREVIEW_CLASS: Record<
  Exclude<WallpaperPreference, "custom">,
  string
> = {
  none: "bg-[var(--color-background)]",
  "gradient-indigo":
    "bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(99,102,241,0.55),transparent),radial-gradient(ellipse_70%_50%_at_80%_90%,rgba(139,92,246,0.45),transparent),linear-gradient(160deg,#0f0f1a,#1a1a2e,#0a0a0f)]",
  "gradient-sunset":
    "bg-[radial-gradient(ellipse_60%_50%_at_70%_20%,rgba(251,146,60,0.5),transparent),radial-gradient(ellipse_50%_40%_at_20%_80%,rgba(244,63,94,0.35),transparent),linear-gradient(160deg,#1a0a0f,#2d1515,#0a0a0f)]",
  "gradient-ocean":
    "bg-[radial-gradient(ellipse_70%_55%_at_15%_85%,rgba(6,182,212,0.45),transparent),radial-gradient(ellipse_60%_45%_at_85%_15%,rgba(59,130,246,0.4),transparent),linear-gradient(160deg,#0a0f14,#0f1a24,#0a0a0f)]",
  "gradient-forest":
    "bg-[radial-gradient(ellipse_65%_50%_at_25%_75%,rgba(16,185,129,0.4),transparent),radial-gradient(ellipse_55%_45%_at_75%_25%,rgba(52,211,153,0.3),transparent),linear-gradient(160deg,#0a0f0d,#0f1a14,#0a0a0f)]",
};

export function WallpaperPicker({
  user,
  embedded = false,
}: {
  user: {
    id: string;
    wallpaperPreference: string;
    wallpaperOverlay: number;
    wallpaperKey: string | null;
    updatedAt: Date;
  };
  embedded?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [wallpaper, setWallpaper] = useState<WallpaperPreference>("none");
  const [overlay, setOverlay] = useState(DEFAULT_WALLPAPER_OVERLAY);
  const [error, setError] = useState("");
  const [savePending, startSaveTransition] = useTransition();
  const [uploadPending, startUploadTransition] = useTransition();
  const [removePending, startRemoveTransition] = useTransition();

  const customUrl = user.wallpaperKey
    ? buildWallpaperUrl(user.id, user.updatedAt)
    : null;
  const hasCustomWallpaper = !!user.wallpaperKey;

  useEffect(() => {
    const preference = parseWallpaperPreference(user.wallpaperPreference);
    const resolved =
      preference === "custom" && !user.wallpaperKey ? "none" : preference;
    setWallpaper(resolved);
    setOverlay(user.wallpaperOverlay);
  }, [
    user.id,
    user.updatedAt,
    user.wallpaperKey,
    user.wallpaperOverlay,
    user.wallpaperPreference,
  ]);

  function syncPreference(
    next: WallpaperPreference,
    nextOverlay: number,
    nextCustomUrl?: string | null,
  ) {
    if (next === "none") {
      persistWallpaperSelection("none");
    } else {
      persistWallpaper(next, nextOverlay, nextCustomUrl ?? customUrl);
    }

    startSaveTransition(async () => {
      const result = await updateWallpaperPreferenceAction(next, nextOverlay);
      if (result.ok) {
        setError("");
        return;
      }
      setError(result.error ?? "保存失败");
    });
  }

  function selectWallpaper(next: WallpaperPreference) {
    if (next === "custom" && !hasCustomWallpaper) {
      return;
    }

    if (next === "none") {
      setWallpaper("none");
      syncPreference("none", overlay);
      return;
    }

    const nextOverlay =
      wallpaper === "none" ? readStoredWallpaperOverlay() : overlay;
    setWallpaper(next);
    setOverlay(nextOverlay);
    syncPreference(
      next,
      nextOverlay,
      next === "custom" ? customUrl : null,
    );
  }

  function handleOverlayChange(value: number) {
    setOverlay(value);
    if (wallpaper === "none") {
      return;
    }

    applyWallpaper(
      wallpaper,
      value,
      wallpaper === "custom" ? customUrl : null,
    );
    syncPreference(wallpaper, value, wallpaper === "custom" ? customUrl : null);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    const formData = new FormData();
    formData.set("wallpaper", file);

    startUploadTransition(async () => {
      const result = await uploadWallpaperAction(formData);
      if (result.ok) {
        router.refresh();
        return;
      }
      setError(result.error ?? "上传失败");
    });

    event.target.value = "";
  }

  function handleRemoveCustom() {
    setError("");
    startRemoveTransition(async () => {
      const result = await removeWallpaperAction();
      if (result.ok) {
        setWallpaper("none");
        persistWallpaperSelection("none");
        router.refresh();
        return;
      }
      setError(result.error ?? "移除失败");
    });
  }

  const pending = savePending || uploadPending || removePending;

  return (
    <div
      className={cn(
        "space-y-5",
        !embedded && "border-t border-[var(--color-border)] px-4 pb-4 pt-4",
      )}
    >
      <div>
        <p className="mb-3 text-xs font-medium tracking-wide text-[var(--color-muted)]">
          壁纸预设
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {WALLPAPER_BUILTIN_PRESETS.map((preset) => {
            const active = wallpaper === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={pending}
                onClick={() => selectWallpaper(preset.id)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 rounded-lg p-1.5 transition",
                  active
                    ? "ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-[var(--color-card)]"
                    : "hover:bg-[var(--color-card-hover)]",
                )}
              >
                <span
                  className={cn(
                    "h-14 w-full rounded-md border border-[var(--color-border)]",
                    PREVIEW_CLASS[preset.id],
                  )}
                />
                <span
                  className={cn(
                    "text-xs",
                    active
                      ? "font-medium text-indigo-300"
                      : "text-[var(--color-muted)]",
                  )}
                >
                  {preset.label}
                </span>
              </button>
            );
          })}

          {hasCustomWallpaper && customUrl && (
            <button
              type="button"
              disabled={pending}
              onClick={() => selectWallpaper("custom")}
              className={cn(
                "group flex flex-col items-center gap-1.5 rounded-lg p-1.5 transition",
                wallpaper === "custom"
                  ? "ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-[var(--color-card)]"
                  : "hover:bg-[var(--color-card-hover)]",
              )}
            >
              <span className="relative h-14 w-full overflow-hidden rounded-md border border-[var(--color-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={customUrl}
                  alt="自定义壁纸预览"
                  className="h-full w-full object-cover"
                />
              </span>
              <span
                className={cn(
                  "text-xs",
                  wallpaper === "custom"
                    ? "font-medium text-indigo-300"
                    : "text-[var(--color-muted)]",
                )}
              >
                自定义
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-[var(--color-muted)]">
          自定义上传
        </p>
        <SettingsFieldHint>
          支持 JPG、PNG、WebP，最大 5MB。上传后保存在服务器，换设备登录可自动恢复。
        </SettingsFieldHint>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {uploadPending ? "上传中…" : "上传壁纸"}
          </Button>
          {hasCustomWallpaper && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={handleRemoveCustom}
            >
              {removePending ? "移除中…" : "移除自定义"}
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className={cn(wallpaper === "none" && "opacity-50")}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="wallpaper-overlay" className="text-xs font-medium tracking-wide text-[var(--color-muted)]">
            遮罩强度
          </label>
          <span className="font-mono text-xs tabular-nums text-[var(--color-muted)]">{overlay}%</span>
        </div>
        <input
          id="wallpaper-overlay"
          type="range"
          min={MIN_WALLPAPER_OVERLAY}
          max={MAX_WALLPAPER_OVERLAY}
          step={5}
          value={overlay}
          disabled={wallpaper === "none" || pending}
          onChange={(event) =>
            handleOverlayChange(Number(event.target.value))
          }
          className="h-2 w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed"
        />
        <SettingsFieldHint>
          数值越高背景越接近纯色，文字越清晰
        </SettingsFieldHint>
      </div>

      <FormError message={error} />

      <SettingsFieldHint>
        壁纸偏好已同步到账户，换设备登录后自动恢复
      </SettingsFieldHint>
    </div>
  );
}
