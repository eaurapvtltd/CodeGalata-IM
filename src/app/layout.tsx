import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code Galatta - College Super Admin Portal",
  description: "Centralized College Management Portal for Code Galatta Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 font-sans">
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#ffffff',
                color: '#18181b',
                border: '1px solid #e4e4e7',
                borderRadius: '12px',
                fontSize: '13px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
