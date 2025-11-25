import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins, Syne } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthMiddleware } from "@/components/auth-middleware"
import { Toaster } from "react-hot-toast"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
})

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://architecture-academics.online'),
  title: "AAO - Architecture-Academics.online | NATA Courses & Architecture Education",
  description: "Architecture-Academics.online (AAO) - Premier platform for NATA preparation, architecture courses, job portal, and educational resources",
  generator: "v0.app",
  keywords: "AAO, Architecture-Academics.online, NATA courses, architecture education, architecture jobs, NATA preparation",
  authors: [{ name: "Architecture-Academics.online" }],
  creator: "AAO - Architecture-Academics.online",
  publisher: "Architecture-Academics.online",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
    shortcut: "/logo.jpg",
  },
  openGraph: {
    title: "AAO - Architecture-Academics.online",
    description: "Premier platform for NATA preparation, architecture courses, job portal, and educational resources",
    images: ["/logo.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AAO - Architecture-Academics.online",
    description: "Premier platform for NATA preparation, architecture courses, job portal, and educational resources",
    images: ["/logo.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${syne.variable} antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.jpg" sizes="any" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="shortcut icon" href="/logo.jpg" />
      </head>
      <body className="font-inter flex flex-col min-h-screen bg-white text-gray-900 transition-colors duration-300">
        <AuthMiddleware>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthMiddleware>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#374151',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              maxWidth: '420px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
