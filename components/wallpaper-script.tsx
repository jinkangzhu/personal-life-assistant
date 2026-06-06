import { buildWallpaperBootScript } from "@/lib/wallpaper";

export function WallpaperScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: buildWallpaperBootScript() }}
    />
  );
}
