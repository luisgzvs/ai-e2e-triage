import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI E2E Test Generator",
  description: "Generate end-to-end test cases for your web applications using Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
