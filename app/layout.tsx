import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeScript } from "@/components/theme-script";
import { WallpaperScript } from "@/components/wallpaper-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Life Assistant",
  description: "个人笔记、日记与待办助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="dark"
      data-wallpaper="none"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <WallpaperScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <div id="app-wallpaper" aria-hidden="true" />
        <div id="app-wallpaper-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
