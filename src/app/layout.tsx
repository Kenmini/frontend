import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_JP, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexSansJP = IBM_Plex_Sans_JP({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans-jp",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "研究室AIガイド | 装置トラブル診断アシスタント",
  description: "装置の不具合や操作方法を質問し、画像付き手順で確認できます。トラブルシューティングをサポートします。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${ibmPlexSansJP.variable} ${ibmPlexMono.variable}`}
      style={{
        fontFamily: "var(--font-ibm-plex-sans-jp), sans-serif",
      }}
    >
      <body style={{ fontFamily: "var(--font-ibm-plex-sans-jp), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
