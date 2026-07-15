import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./i18n/context";

export const metadata: Metadata = {
  title: "ITHAKA — Сергей Тимошенко",
  description:
    "Сайты, автоматизация и AI-инструменты. От неясной задачи к работающей системе.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
