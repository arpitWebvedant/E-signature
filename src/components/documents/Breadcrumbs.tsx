'use client'

import { HomeIcon } from 'lucide-react'
import Link from 'next/link'

export const Breadcrumbs = () => {
  return (
    <div className='flex flex-1 items-center text-sm font-medium text-muted-foreground hover:text-muted-foreground/80'>
      <Link href='/documents' className='flex items-center'>
        <HomeIcon className='mr-2 h-4 w-4' />
        Home
      </Link>
    </div>
  )
}
