import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DIG | Data & Intelligence Guild",
  description: "The Data & Intelligence Guild (DIG) is a community of curious minds, creators, and problem-solvers united by a shared passion for Artificial Intelligence, Data Science, and innovation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="flex flex-col">{children}</body>
    </html>
  );
}
