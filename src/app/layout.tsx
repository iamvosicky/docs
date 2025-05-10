import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SimpleAuthProvider } from "@/components/auth/simple-auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contract Generation Platform",
  description: "Generate customized legal documents with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SimpleAuthProvider>
            {/* The SimpleAuthProvider will handle authentication state */}
            <div className="relative flex min-h-screen flex-col bg-background">
              <Navbar />
              <main className="flex-1">{children}</main>
              <footer className="border-t py-6 md:py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      &copy; {new Date().getFullYear()} Contract Generator. All rights reserved.
                    </p>
                    <div className="mt-4 sm:mt-0">
                      <p className="text-sm text-muted-foreground">
                        Powered by Next.js and Cloudflare
                      </p>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
            <Sonner />
          </SimpleAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
