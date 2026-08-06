import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeScript } from "@/components/theme";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "GEMATI Pagerwojo",
  description:
    "Sistem Informasi Pendampingan Makan Telur Cegah Stunting — Kecamatan Pagerwojo, Tulungagung",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
