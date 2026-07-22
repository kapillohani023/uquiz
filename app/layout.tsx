import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/app/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "uquiz",
  description:
    "Turn YouTube links into custom courses and generate quizzes on the fly.",
  icons: {
    icon: "/uquiz.jpg",
    apple: "/uquiz.jpg",
  },
  appleWebApp: {
    title: "uquiz",
    statusBarStyle: "black-translucent",
    startupImage: ["/uquiz.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#d0342c",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-uq-bg text-uq-ink">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
