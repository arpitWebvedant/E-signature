'use client'

import { ActionButtons } from "./ActionButtons"

interface DocumentsHeaderProps {
  title: string
}

export const DocumentsHeader = ({ title }: DocumentsHeaderProps) => {
  return (
    <div className='flex flex-wrap gap-x-4 gap-y-8 justify-between items-center'>
      <div className='flex flex-col items-start'>
        <h2 className='text-lg font-semibold text-color-title'>{title}</h2>
        <p className='text-sm text-color-mute'>Keep track of documents and their security ratings.</p>
      </div>
      <ActionButtons />

      
    </div>
  )
}
