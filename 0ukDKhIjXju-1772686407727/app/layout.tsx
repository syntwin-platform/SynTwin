import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })

export const metadata: Metadata = {
  title: "SynTwin — Industrial Digital Twin Platform",
  description:
    "Monitor and control industrial robot arms in your smart factory with real-time 3D Digital Twin visualization.",
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
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#F9FAFA] text-[#0F172A]`}>
        {children}
      </body>
    </html>
  )
}
