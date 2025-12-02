import { XCircle, SignatureIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { HTMLAttributes } from 'react'
import { cn } from '../lib/ClsxConnct'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import CompletedIcon from '@/assets/icons/completed.png'
import PendingIcon from '@/assets/icons/pending.png'
import DraftIcon from '@/assets/icons/draft.png'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import RejectForm from '@/components/ui/reject-form'

type StatusKey =
  | 'PENDING'
  | 'COMPLETED'
  | 'DRAFT'
  | 'REJECTED'
  | 'INBOX'
  | 'ALL'

type FriendlyStatus = {
  label: string
  labelExtended: string
  icon?: React.ReactNode
  color: string
}

export const FRIENDLY_STATUS_MAP: Record<StatusKey, FriendlyStatus> = {
  PENDING: {
    label: 'Pending',
    labelExtended: 'Document pending',
    icon: <Image src={PendingIcon} width={14} height={14} alt='Pending' />,
    color: 'text-[#D0A806] bg-[#D0A806]/10 w-fit px-2 py-1 rounded-full',
  },
  COMPLETED: {
    label: 'Completed',
    labelExtended: 'Document completed',
    icon: <Image src={CompletedIcon} width={14} height={14} alt='Completed' />,
    color: 'text-[#2F9449] bg-[#2F9449]/10 w-fit px-2 py-1 rounded-full',
  },
  DRAFT: {
    label: 'Draft',
    labelExtended: 'Document draft',
    icon: <Image src={DraftIcon} width={14} height={14} alt='Draft' />,
    color: 'text-[#6A27D9] bg-[#6A27D9]/10 w-fit px-2 py-1 rounded-full',
  },
  REJECTED: {
    label: 'Rejected',
    labelExtended: 'Document rejected',
    icon: <XCircle size={14} />,
    color: 'text-red-500 bg-red-600/10 w-fit px-2 py-1 rounded-full',
  },
  INBOX: {
    label: 'Inbox',
    labelExtended: 'Document inbox',
    icon: <SignatureIcon size={14} />,
    color: 'text-muted-foreground',
  },
  ALL: {
    label: 'All',
    labelExtended: 'All documents',
    color: 'text-muted-foreground',
  },
}

export type DocumentStatusProps = HTMLAttributes<HTMLSpanElement> & {
  status?: string
  inheritColor?: boolean
  showIcon?: boolean
  documentSignData?: any // Add this prop to access rejection data
  isFolderView?: boolean
}

export const DocumentStatus = ({
  className,
  status,
  inheritColor = false,
  showIcon = true,
  documentSignData,
  isFolderView,
  ...props
}: DocumentStatusProps) => {
  const [isOpenDialog, setIsOpenDialog] = useState(false)
  const { label, icon, color } =
    FRIENDLY_STATUS_MAP[(status?.toUpperCase() as StatusKey) || 'ALL'] ||
    FRIENDLY_STATUS_MAP.ALL

  // Check if document is rejected and has rejection data
  const isRejected = status?.toUpperCase() === 'REJECTED'
  const rejectionData = documentSignData?.rejection

  const effectiveShowIcon = isFolderView ? false : showIcon
  const effectiveInheritColor = isFolderView ? true : inheritColor

  const StatusContent = () => (
    <div
      className={cn(
        'flex h-fit items-center gap-1',
        className,
        !effectiveInheritColor && color,
      )}
      {...props}
    >
      {effectiveShowIcon && icon}
      <span className='text-xs'>{label}</span>
    </div>
  )
  const handleRejectSubmit = async (payload: {
    reason: string
    subject: string
    category: string
    notifySender: boolean
  }) => {
    setIsOpenDialog(false)
  }
  // Show tooltip only for rejected documents with rejection reason
  if (isRejected && rejectionData?.reason) {
    return (
      <>
        <TooltipProvider>
          <div className='flex gap-2 items-center'>
            <div>
              <StatusContent />
            </div>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className='flex items-center p-1 rounded-full border cursor-pointer bg-black/5'
                    onClick={() => setIsOpenDialog(true)}
                  >
                    <Eye className='w-4 h-4' />
                  </div>
                </TooltipTrigger>
                <TooltipContent className='relative px-3 py-2 max-w-xs text-sm text-gray-900 bg-white rounded-lg border shadow-xl'>
                  {/* Arrow */}
                  <div className='absolute -top-1 left-4 w-2 h-2 rotate-45 bg-white border-l border-t border-gray-200 shadow-[0_-1px_1px_rgba(0,0,0,0.02)]' />
                  <p>{rejectionData.reason}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
        <RejectForm
          open={isOpenDialog}
          onOpenChange={setIsOpenDialog}
          onSubmit={handleRejectSubmit}
          isClose
          viewOnly
          title='Rejection details'
          description={undefined}
          initialReason={rejectionData.reason}
          initialSubject={rejectionData.subject}
          initialCategory={rejectionData.category}
          initialNotifySender={rejectionData.notifySender}
        />
      </>
    )
  }

  return <StatusContent />
}
