
import ClientWrapper from '@/components/common/ClientWrapper'
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import '@OmnisAIOrg/component-library/styles.css';
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'OmnisProof',
  description: 'OmnisProof description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body cz-shortcut-listen='true'>
        <Suspense>
          <ClientWrapper>{children}</ClientWrapper>
        </Suspense>
        <Toaster />
      </body>
    </html>
  )
}
