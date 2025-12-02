import { forwardRef } from 'react'

import { cn } from '@/components/lib/ClsxConnct'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import type { SelectProps } from '@radix-ui/react-select'
import { BadgeCheck, Copy, Eye, InfoIcon, PencilLine, User } from 'lucide-react'

const ROLE_ICONS = {
  SIGNER: <PencilLine className='w-4 h-4' />,
  APPROVER: <BadgeCheck className='w-4 h-4' />,
  CC: <Copy className='w-4 h-4' />,
  VIEWER: <Eye className='w-4 h-4' />,
  ASSISTANT: <User className='w-4 h-4' />,
}

export type RecipientRoleSelectProps = SelectProps & {
  hideCCRecipients?: boolean
  isAssistantEnabled?: boolean
}

export const RecipientRoleSelect = forwardRef<
  HTMLButtonElement,
  RecipientRoleSelectProps
>(({ hideCCRecipients, isAssistantEnabled = true, ...props }, ref) => (
  <Select {...props}>
    <SelectTrigger ref={ref} className='p-2 bg-white'>
      {ROLE_ICONS[props.value as RecipientRole]}
    </SelectTrigger>

    <SelectContent align='end'>
      <SelectItem value={'SIGNER'}>
        <div className='flex items-center'>
          <div className='flex w-[150px] items-center'>
            <span className='mr-2'>{ROLE_ICONS['SIGNER']}</span>
            Needs to sign
          </div>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='w-4 h-4' />
            </TooltipTrigger>
            <TooltipContent className='p-4 max-w-md text-foreground z-9999'>
              <p>
                The recipient is required to sign the document for it to be
                completed.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SelectItem>

      <SelectItem value={'APPROVER'}>
        <div className='flex items-center'>
          <div className='flex w-[150px] items-center'>
            <span className='mr-2'>{ROLE_ICONS['APPROVER']}</span>
            Needs to approve
          </div>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='w-4 h-4' />
            </TooltipTrigger>
            <TooltipContent className='p-4 max-w-md text-foreground z-9999'>
              <p>
                The recipient is required to approve the document for it to be
                completed.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SelectItem>

      <SelectItem value={'VIEWER'}>
        <div className='flex items-center'>
          <div className='flex w-[150px] items-center'>
            <span className='mr-2'>{ROLE_ICONS['VIEWER']}</span>
            Needs to view
          </div>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='w-4 h-4' />
            </TooltipTrigger>
            <TooltipContent className='p-4 max-w-md text-foreground z-9999'>
              <p>
                The recipient is required to view the document for it to be
                completed.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SelectItem>

      {!hideCCRecipients && (
        <SelectItem value={'CC'}>
          <div className='flex items-center'>
            <div className='flex w-[150px] items-center'>
              <span className='mr-2'>{ROLE_ICONS['CC']}</span>
              Receives copy
            </div>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className='w-4 h-4' />
              </TooltipTrigger>
              <TooltipContent className='p-4 max-w-md text-foreground z-9999'>
                <p>
                  The recipient is not required to take any action and receives
                  a copy of the document after it is completed.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </SelectItem>
      )}

      <SelectItem
        value={'ASSISTANT'}
        disabled={!isAssistantEnabled}
        className={cn(
          !isAssistantEnabled &&
            'cursor-not-allowed opacity-50 data-[disabled]:pointer-events-auto',
        )}
      >
        <div className='flex items-center'>
          <div className='flex w-[150px] items-center'>
            <span className='mr-2'>{ROLE_ICONS['ASSISTANT']}</span>
            Can prepare
          </div>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className='w-4 h-4' />
            </TooltipTrigger>
            <TooltipContent className='p-4 max-w-md text-foreground z-9999'>
              <p>
                {isAssistantEnabled
                  ? 'The recipient can prepare the document for later signers by pre-filling suggest values.'
                  : 'Assistant role is only available when the document is in sequential signing mode.'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
))

RecipientRoleSelect.displayName = 'RecipientRoleSelect'
