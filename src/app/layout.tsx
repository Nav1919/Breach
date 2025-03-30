// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import GlobalParticles from '@/components/ui/global-particles'

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