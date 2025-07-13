import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pick2 Game',
  description: 'Pick2 - 밸런스 게임',
  generator: 'Pick2 Game',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
