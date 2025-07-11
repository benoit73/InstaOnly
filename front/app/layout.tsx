import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InstaOnlyManager',
  description: 'InstaOnlyManager',
  generator: 'bebnoit.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
                <link rel="icon" type="image/png" sizes="32x32" href="https://static2.onlyfans.com/static/prod/f/202507101037-e0353341e3/icons/favicon-32x32.png"></link>
      </head>
      <body>{children}</body>
    </html>
  )
}
