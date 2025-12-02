'use client'

import { FolderPlusIcon } from 'lucide-react'

export const FolderGrid = () => {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      <button className='group relative h-full rounded-lg border border-border bg-background text-foreground shadow-[0_0_0_4px_theme(colors.gray.100/70%),0_0_0_1px_theme(colors.gray.100/70%),0_0_0_0.5px_var(colors.primary.DEFAULT/70%)] transition-all hover:bg-muted/50 backdrop-blur-[2px] dark:shadow-[0]'>
        <div className='p-4'>
          <div className='flex items-center gap-3'>
            <FolderPlusIcon className='h-6 w-6 text-muted-foreground/60' />
            <div>
              <h3 className='flex items-center gap-2 font-medium text-muted-foreground'>
                Create folder
              </h3>
              <div className='mt-1 truncate text-xs text-muted-foreground/60'>
                Organise your documents
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
