import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar, BreadcrumbBar } from "@/components/layout/Navbar";
import { LayoutProvider } from "@/components/layout/LayoutContext";

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
        <LayoutProvider>
          <div className="flex min-h-screen overflow-hidden">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top Navigation */}
              <Navbar />

              {/* Tab bar + Breadcrumb */}
              <BreadcrumbBar />

              {/* Main Content */}
              <main className="flex-1 overflow-y-auto p-4">
                {children}
              </main>
            </div>
          </div>
        </LayoutProvider>
      </body>
    </html>
  );
}
