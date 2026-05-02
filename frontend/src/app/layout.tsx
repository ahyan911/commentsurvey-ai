import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommentSurvey AI",
  description: "Turn social media comments into smart survey insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
