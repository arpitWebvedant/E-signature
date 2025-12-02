// components/general/settings-nav-desktop.tsx
'use client'

import { User, Settings2, Key, Braces } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../lib/ClsxConnct'
import { Button } from '../ui/button'

export const SettingsDesktopNav = ({ className }: { className?: string }) => {
  const pathname = usePathname()

  return (
    <div className={cn('flex flex-col gap-y-2 rounded-lg border h-[calc(100vh-15vh)]', className)}>
      <Link href="/settings/profile">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start px-4 py-6 h-auto border-b rounded-none',
            pathname?.startsWith('/settings/profile') && ' text-primary'
          )}
        >
          <User className="mr-2 w-5 h-5" fill={pathname?.startsWith('/settings/profile') ? '#3353F8' : '#00000014'} />
          Profile
        </Button>
      </Link>
      <Link href="/settings/tokens">
      <Button
          variant="ghost"
          className={cn(
            'w-full justify-start px-4 py-6 h-auto border-b rounded-none',
            pathname?.startsWith('/settings/tokens') && ' text-primary'
          )}
        >
          <Braces className="mr-2 w-5 h-5" fill={pathname?.startsWith('/settings/tokens') ? '#3353F8' : '#00000014'} />
          API Tokens
        </Button>
      </Link>
      {/* <Link href="/settings/preferences">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith('/settings/preferences') && ' text-primary'
          )}
        >
          <Settings2 className="mr-2 w-5 h-5" fill={pathname?.startsWith('/settings/preferences') ? '#3353F8' : '#00000014'} />
          Preferences
        </Button>
      </Link>

      <Link href="/settings/tokens">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith('/settings/tokens') && 'bg-gray-100 text-primary'
          )}
        >
          <Key className="mr-2 w-5 h-5" />
          API Tokens
        </Button>
      </Link> */}
    </div>
  )
}
