// components/general/settings-nav-mobile.tsx
'use client'

import { User, Settings2, Key } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../lib/ClsxConnct'
import { Button } from '../ui/button'

export const SettingsMobileNav = () => {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/settings/profile">
        <Button
          variant="outline"
          className={cn(
            pathname?.startsWith('/settings/profile') && 'bg-secondary'
          )}
        >
          <User className="mr-2 w-5 h-5" />
          Profile
        </Button>
      </Link>

      <Link href="/settings/preferences">
        <Button
          variant="outline"
          className={cn(
            pathname?.startsWith('/settings/preferences') && 'bg-secondary'
          )}
        >
          <Settings2 className="mr-2 w-5 h-5" />
          Preferences
        </Button>
      </Link>

      <Link href="/settings/tokens">
        <Button
          variant="outline"
          className={cn(
            pathname?.startsWith('/settings/tokens') && 'bg-secondary'
          )}
        >
          <Key className="mr-2 w-5 h-5" />
          API Tokens
        </Button>
      </Link>
    </div>
  )
}
