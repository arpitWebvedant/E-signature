'use client'

import { useRef, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import CentralizedAuthGuard from '@/context/CentralizedAuthGuard'
import { GlobalContextProvider } from '@/context/GlobalContext'
import { PDFContextProvider } from '@/context/PDFContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Sidebar } from '../general/sidebar'
import { Navbar } from '../general/navbar'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())
  const [sideShow, setSideShow] = useState(true)
  const [navbarHeight, setNavbarHeight] = useState(0)

  const navbarRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight)
    }
  }, [navbarRef])

  const isPublic = (() => {
    if (!pathname) return false

    if (pathname.includes('/sign_document/') || pathname.includes('/reject-document/')) {
      const token = searchParams.get('token')
      const action = searchParams.get('action')
      const checkId = searchParams.get('checkId')

      if (token &&( action === 'sign' || action === 'reject') && checkId) {
        return true
      }
    }

    return false
  })()

  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <GlobalContextProvider>
          <PDFContextProvider>
            <CentralizedAuthGuard isPublic={isPublic}>
              <div className='flex relative flex-col h-[100svh]'>
                {!isPublic && (
                  <div ref={navbarRef} className='sticky top-0 z-10 w-full'>
                    <Navbar setSideShow={setSideShow} sideShow={sideShow} />
                  </div>
                )}

                {/* Layout container */}
                <div
                  className={`flex flex-1 h-[calc(100svh)] overflow-hidden ${
                    isPublic ? '':''}`}
                >
                  {/* Sidebar: only if not public */}
                  {!isPublic && (
                    <div
                      className={`${
                        sideShow ? '':'z-50'} h-[calc(100svh-${navbarHeight}px)] top-[${navbarHeight}px]`}
                    >
                      <Sidebar />
                    </div>
                  )}

                  {/* Main content */}
                  <main
                    className={`w-full h-full bg-background overflow-auto ${
                      isPublic ? 'p-0' : 'p-4'
                    }`}
                  >
                    {children}
                  </main>
                </div>
              </div>
            </CentralizedAuthGuard>
          </PDFContextProvider>
        </GlobalContextProvider>
      </QueryClientProvider>
    </TooltipProvider>
  )
}
