import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Vaquero Market", // or your journal title
  description: "A community-powered marketplace", // update if you want
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900">
        <Header />
        {children}
      </body>
    </html>
  );
}
