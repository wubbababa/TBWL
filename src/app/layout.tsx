import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "客户端贴单ERP系统",
  description: "Next.js ERP Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#ecf0f5] text-gray-800 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
