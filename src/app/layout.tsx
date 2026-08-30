import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provedores } from "@/components/provedores";
import { ThemeScript } from "@/components/theme-script";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Finan", template: "%s · Finan" },
  description: "Controle financeiro que age antes do caixa, não depois.",
  applicationName: "Finan",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Finan" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e0f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <Provedores>{children}</Provedores>
      </body>
    </html>
  );
}
