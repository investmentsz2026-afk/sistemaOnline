import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { MobileBottomNav } from "@/components/landing/MobileBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema Web Empresarial | SaaS Moderno",
  description: "Sistema web profesional escalable para empresas modernas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body 
        className="min-h-full flex flex-col font-sans bg-white dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-300"
      >
        <ThemeProvider>
          <AuthProvider>
            {/* Monetag Vignette Banner Global */}
            <Script id="monetag-vignette" strategy="afterInteractive">
              {`(function(s){s.dataset.zone='11056724',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
            </Script>
            
            <div className="flex-1 flex flex-col relative min-h-screen">
              {children}
            </div>
            <Toaster position="top-right" richColors />
            <MobileBottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

