import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Code Galatta — Faculty & College Admin Portal',
  description: 'Multi-tenant College Admin and Faculty Portal for coding education, proctored exams, plagiarism detection, and placement readiness analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F4F6F8] text-[#111827] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
