'use client'

import {
  ArrowRightIcon,
  FolderClosed,
  FolderIcon,
  FolderPlusIcon,
  MoreVerticalIcon,
  PinIcon,
  SettingsIcon,
  TrashIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import CreateFolderDialog from '../common/CreateFolderDialog'
import { useState } from 'react'

export type FolderType = 'DOCUMENT' | 'TEMPLATE'

export type FolderCardProps = {
  folder: {
    id: string
    name: string
    type: FolderType
    pinned?: boolean
    _count: {
      documents?: number
      templates?: number
      subfolders?: number
    }
    documentCount?: number
    subfolderCount?: number
  }
  onMove: (folder: any) => void
  onPin: (folderId: string) => void
  onUnpin: (folderId: string) => void
  onSettings: (folder: any) => void
  onDelete: (folder: any) => void
  isDeleting?: boolean
}

// 📌 Helper for pluralization
const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`

export const FolderCard = ({
  folder,
  onMove,
  onPin,
  onUnpin,
  onSettings,
  onDelete,
  isDeleting = false,
}: FolderCardProps) => {
  // 📌 Format path based on folder type
  const formatPath = () => {
    return folder.type === 'DOCUMENT'
      ? `/documents/${folder.id}`
      : `/folders/${folder.id}`
  }

  return (
    <Link href={formatPath()} key={folder.id}>
      <Card
        className='h-full bg-white rounded-lg border transition-all hover:bg-muted/50 border-border'
        aria-disabled={isDeleting}
      >
        <CardContent className='p-3'>
          <div className='flex gap-3 items-center min-w-0'>
            <div className='bg-[#F2F4FF] text-[#3353F8] border border-[#DCE2FF] rounded-lg p-2'>
              <FolderClosed className='flex-shrink-0 w-6 h-6 text-primary' />
            </div>

            <div className='flex justify-between items-center w-full min-w-0'>
              <div className='flex-1 min-w-0'>
                <h3 className='flex gap-2 items-center min-w-0 font-medium'>
                  <span className={`truncate ${isDeleting ? 'opacity-60' : ''}`}>
                    {folder.name}
                  </span>
                  {folder?.pinned && (
                    <PinIcon className='flex-shrink-0 w-3 h-3 text-primary' />
                  )}
                </h3>

                <div className='flex mt-1 space-x-2 text-xs truncate text-muted-foreground'>
                  <span>
                    {folder.type === 'TEMPLATE'
                      ? pluralize(
                          folder?._count?.templates ?? 0,
                          'template',
                          'templates',
                        )
                      : pluralize(
                          folder?.documentCount ?? 0,
                          'document',
                          'documents',
                        )}
                  </span>
                  <span>•</span>
                  <span>
                    {pluralize(
                      folder?.subfolderCount ?? 0,
                      'folder',
                      'folders',
                    )}
                  </span>
                </div>
              </div>

              {/* More options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='p-0 w-8 h-8 border'
                    disabled={isDeleting}
                    data-testid='folder-card-more-button'
                  >
                    <MoreVerticalIcon className='w-4 h-4' />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  onClick={(e) => e.stopPropagation()}
                  align='end'
                >
                  <DropdownMenuItem onClick={() => onMove(folder)}>
                    <ArrowRightIcon className='mr-2 w-4 h-4' />
                    <div>Move</div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      folder?.pinned ? onUnpin(folder.id) : onPin(folder.id)
                    }
                  >
                    <PinIcon className='mr-2 w-4 h-4' />
                    {folder.pinned ? <div>Unpin</div> : <div>Pin</div>}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => onSettings(folder)}>
                    <SettingsIcon className='mr-2 w-4 h-4' />
                    <div>Settings</div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => onDelete(folder)}>
                    <TrashIcon className='mr-2 w-4 h-4' />
                    <div>Delete</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// 🆕 Empty Card
export const FolderCardEmpty = ({ type ,callback }: { type: FolderType,callback?: () => void }) => {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  return (
    <>
      <Card className='h-full border transition-all cursor-pointer hover:bg-muted/50 border-border'>
        <CardContent className='p-4 cursor-pointer' onClick={() => setShowCreateFolderModal(true)}>
          <div className='flex gap-3 items-center'>
            <FolderPlusIcon className='w-6 h-6 text-muted-foreground/60' />

            <div>
              <h3 className='flex gap-2 items-center font-medium text-muted-foreground'>
                <div>Create folder</div>
              </h3>

              <div className='flex mt-1 space-x-2 text-xs truncate text-muted-foreground/60'>
                {type === 'DOCUMENT' ? (
                  <div>Organize your documents</div>
                ) : (
                  <div>Organize your templates</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <CreateFolderDialog
        showModal={showCreateFolderModal}
        setShowModal={setShowCreateFolderModal}
        callback={callback}
      />
    </>
  )
}
