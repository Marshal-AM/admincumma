import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FacilitiEase Admin",
  description: "Admin dashboard for FacilitiEase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          <Header />
          <div className="pt-[80px]">
            <Sidebar />
            <div className="pl-64">
              <main className="p-6 bg-white">
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
