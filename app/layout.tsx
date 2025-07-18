import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pick2 Game',
  description: 'Pick2 - 밸런스 게임',
  generator: 'Pick2 Game',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
