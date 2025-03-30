// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Outfit } from "next/font/google"
import Script from 'next/script'
import GlobalParticles from '@/components/ui/global-particles'

// Configure the Outfit font
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  // Optionally add weight variants if needed
  // weight: ['400', '500', '700'],
  variable: '--font-outfit', // Optional: For use in CSS variables
})

export const metadata: Metadata = {
  title: 'Breach',
  description: 'Supercharge your brainstorming.',
  icons: {
    icon: '/favicon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${outfit.className}`}>
      <head>
        <Script 
          src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <div className="relative min-h-screen">
          <GlobalParticles />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}