import {
  DEFAULT_WALLPAPER_OVERLAY,
  MAX_WALLPAPER_OVERLAY,
  MIN_WALLPAPER_OVERLAY,
  WALLPAPER_CUSTOM_URL_KEY,
  WALLPAPER_OVERLAY_KEY,
  WALLPAPER_PRESET_IDS,
  WALLPAPER_STORAGE_KEY,
  clampWallpaperOverlay,
  parseWallpaperPreference,
  type WallpaperPreference,
} from "@/lib/validators/settings";

export function applyWallpaper(
  wallpaper: WallpaperPreference,
  overlay: number,
  customUrl?: string | null,
) {
  const root = document.documentElement;
  root.dataset.wallpaper = wallpaper;

  const opacity =
    wallpaper === "none" ? 1 : clampWallpaperOverlay(overlay) / 100;

  root.style.setProperty("--wallpaper-overlay", String(opacity));

  if (wallpaper === "custom" && customUrl) {
    root.style.setProperty("--wallpaper-image", `url("${customUrl}")`);
  } else {
    root.style.removeProperty("--wallpaper-image");
  }
}

export function readStoredWallpaper(): WallpaperPreference {
  try {
    const stored = localStorage.getItem(WALLPAPER_STORAGE_KEY);
    return parseWallpaperPreference(stored);
  } catch {
    return "none";
  }
}

export function readStoredWallpaperOverlay(): number {
  try {
    const stored = localStorage.getItem(WALLPAPER_OVERLAY_KEY);
    const value = Number(stored);
    if (Number.isFinite(value)) {
      return clampWallpaperOverlay(value);
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_WALLPAPER_OVERLAY;
}

function readStoredCustomUrl(): string | null {
  try {
    return localStorage.getItem(WALLPAPER_CUSTOM_URL_KEY);
  } catch {
    return null;
  }
}

export function persistWallpaper(
  wallpaper: WallpaperPreference,
  overlay: number,
  customUrl?: string | null,
) {
  try {
    localStorage.setItem(WALLPAPER_STORAGE_KEY, wallpaper);
    if (wallpaper !== "none") {
      localStorage.setItem(
        WALLPAPER_OVERLAY_KEY,
        String(clampWallpaperOverlay(overlay)),
      );
    }
    if (wallpaper === "custom" && customUrl) {
      localStorage.setItem(WALLPAPER_CUSTOM_URL_KEY, customUrl);
    } else {
      localStorage.removeItem(WALLPAPER_CUSTOM_URL_KEY);
    }
  } catch {
    // ignore storage errors
  }

  const resolvedCustomUrl =
    wallpaper === "custom" ? (customUrl ?? readStoredCustomUrl()) : null;
  applyWallpaper(wallpaper, overlay, resolvedCustomUrl);
}

export function persistWallpaperSelection(
  wallpaper: WallpaperPreference,
  customUrl?: string | null,
) {
  try {
    localStorage.setItem(WALLPAPER_STORAGE_KEY, wallpaper);
    if (wallpaper !== "custom") {
      localStorage.removeItem(WALLPAPER_CUSTOM_URL_KEY);
    } else if (customUrl) {
      localStorage.setItem(WALLPAPER_CUSTOM_URL_KEY, customUrl);
    }
  } catch {
    // ignore storage errors
  }

  if (wallpaper === "none") {
    applyWallpaper("none", DEFAULT_WALLPAPER_OVERLAY);
    return;
  }

  const overlay = readStoredWallpaperOverlay();
  const resolvedCustomUrl =
    wallpaper === "custom" ? (customUrl ?? readStoredCustomUrl()) : null;
  applyWallpaper(wallpaper, overlay, resolvedCustomUrl);
}

export function syncWallpaperFromServer(
  wallpaper: WallpaperPreference,
  overlay: number,
  customUrl?: string | null,
) {
  persistWallpaper(wallpaper, overlay, customUrl ?? null);
}

export function buildWallpaperBootScript() {
  const presets = JSON.stringify(WALLPAPER_PRESET_IDS);
  return `(function(){try{var valid=${presets};var w=localStorage.getItem("${WALLPAPER_STORAGE_KEY}");var o=localStorage.getItem("${WALLPAPER_OVERLAY_KEY}");var u=localStorage.getItem("${WALLPAPER_CUSTOM_URL_KEY}");if(!valid.includes(w))w="none";if(w==="custom"&&!u)w="none";var overlay=parseInt(o,10);if(!(overlay>=${MIN_WALLPAPER_OVERLAY}&&overlay<=${MAX_WALLPAPER_OVERLAY}))overlay=${DEFAULT_WALLPAPER_OVERLAY};if(w==="none")overlay=100;document.documentElement.dataset.wallpaper=w;document.documentElement.style.setProperty("--wallpaper-overlay",String(overlay/100));if(w==="custom"&&u){document.documentElement.style.setProperty("--wallpaper-image",'url("'+u+'")');}else{document.documentElement.style.removeProperty("--wallpaper-image");}}catch(e){document.documentElement.dataset.wallpaper="none";document.documentElement.style.setProperty("--wallpaper-overlay","1");document.documentElement.style.removeProperty("--wallpaper-image");}})();`;
}
