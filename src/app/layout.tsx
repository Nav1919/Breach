// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Outfit } from "next/font/google"

export const metadata: Metadata = {
  title: 'Patent Black Hole',
  description: 'Discover hidden innovation gaps in patents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}