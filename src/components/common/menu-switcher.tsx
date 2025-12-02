import { useGlobalContext } from '@/context/GlobalContext'
import { ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'
import { cn } from '../lib/ClsxConnct'
import { formatAvatarUrl } from '../lib/utils/avatars'
import { AvatarWithText } from '../ui/avatar'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { extractInitials } from './recipient-formatter'

export const MenuSwitcher = () => {
  const { user } = useGlobalContext()


  const formatAvatarFallback = (name?: string) => {
    if (name !== undefined) {
      return name.slice(0, 1).toUpperCase()
    }

    return user?.data?.fullName
      ? extractInitials(user?.data?.fullName)
      : user?.data?.email.slice(0, 1).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-testid='menu-switcher'
          variant='none'
          className='flex relative flex-row items-center px-0 py-2 h-12 ring-0 focus:outline-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-transparent md:px-2'
        >
          <AvatarWithText
            avatarSrc={formatAvatarUrl(user?.data?.avatarImageId)}
            avatarFallback={formatAvatarFallback(
              user?.data?.fullName || user?.data?.email,
            )}
            primaryText={user?.data?.fullName}
            secondaryText={`Personal Account`}
            rightSideComponent={
              <ChevronsUpDown className='ml-auto w-4 h-4 text-muted-foreground' />
            }
            textSectionClassName='hidden lg:flex'
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn('ml-6 w-full z-[60] min-w-[12rem] md:ml-0')}
        align='end'
        forceMount
      >
    
        <DropdownMenuItem className='px-4 py-2 text-muted-foreground' asChild>
          <Link href='/settings/profile'>User settings</Link>
        </DropdownMenuItem>

        <DropdownMenuItem className='text-destructive/90 hover:!text-destructive px-4 py-2'>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
