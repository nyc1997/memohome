
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "개인 관리 프로그램",
  description: "개인 관리 프로그램",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}

