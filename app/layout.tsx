import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "Camaral - Your slides always on",
  description: "Turn your presentations 24/7 into an AI agent that explains, pitch and answer questions automatically to anyone, anytime.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script
          src="https://adora-cdn.com/adora-start.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window !== 'undefined' && (window as any).adoraStart) {
              (window as any).adoraStart({
                orgId: "c5ab12e4-249d-4873-84ea-685a0c345a87",
                uid: "",
                properties: {
                  "Subscription tier": "",
                  "Company name": ""
                }
              });
            }
          }}
        />
      </body>
    </html>
  );
}
