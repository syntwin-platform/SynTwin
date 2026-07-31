import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })

export const metadata: Metadata = {
  title: "SynTwin — Giám sát vận hành robot công nghiệp",
  description:
    "Nền tảng giám sát đội robot, telemetry và quyền truy cập nhà máy trên một giao diện thống nhất.",
  icons: {
    icon: "/images/syntwin-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-canvas text-ink`}>
        {children}
      </body>
    </html>
  )
}
