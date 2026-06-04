import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KB Hair — Premium Raw Hair",
  description: "La Beauté Naturelle, Notre Engagement. Perruques et extensions 100% cheveux naturels.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
