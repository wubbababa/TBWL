import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录 · 客户端贴单ERP系统',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render without the main app shell (no sidebar / navbar)
  return <>{children}</>;
}
