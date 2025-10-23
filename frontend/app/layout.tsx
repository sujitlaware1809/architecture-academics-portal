import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins, Syne } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthMiddleware } from "@/components/auth-middleware"

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
  title: "Architecture Academics - Architecture Education Platform",
  description: "Modern architecture education platform with courses, jobs, events, and resources",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${syne.variable} antialiased`}>
      <body className="font-inter flex flex-col min-h-screen">
        <AuthMiddleware>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthMiddleware>
      </body>
    </html>
  )
}
