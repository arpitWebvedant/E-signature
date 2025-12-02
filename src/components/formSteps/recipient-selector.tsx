import { useCallback, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { sortBy } from 'remeda'

import { getRecipientColorStyles } from '../common/recipient-colors'
import { cn } from '../lib/ClsxConnct'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Recipient } from '../schema/types'

export interface RecipientSelectorProps {
  className?: string
  selectedRecipient: Recipient | null
  onSelectedRecipientChange: (recipient: Recipient) => void
  recipients: Recipient[]
}

export const RecipientSelector = ({
  className,
  selectedRecipient,
  onSelectedRecipientChange,
  recipients,
}: RecipientSelectorProps) => {
  const [open, setOpen] = useState(false)

  const recipientsByRole = useCallback(() => {
    const recipientsByRole: Record<string, Recipient[]> = {
      CC: [],
      VIEWER: [],
      SIGNER: [],
      APPROVER: [],
      ASSISTANT: [],
    }

    recipients.forEach((recipient) => {
      recipientsByRole[recipient.role].push(recipient)
    })

    return recipientsByRole
  }, [recipients])

  const recipientsByRoleToDisplay = useCallback(() => {
    return Object.entries(recipientsByRole())
      .filter(
        ([role]) => role !== 'CC' && role !== 'VIEWER' && role !== 'ASSISTANT',
      )
      .map(
        ([role, roleRecipients]) =>
          [
            role,
            sortBy(
              roleRecipients,
              [(r) => r.signingOrder || Number.MAX_SAFE_INTEGER, 'asc'],
              [(r) => r.id, 'asc'],
            ),
          ] as [string, Recipient[]],
      )
  }, [recipientsByRole])
console.log(recipientsByRoleToDisplay(),selectedRecipient)
  return (
    <div className="relative">
      {/* Trigger button */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          'bg-background text-muted-foreground hover:text-foreground justify-between font-normal w-full',
          getRecipientColorStyles(
            Math.max(
              recipients.findIndex((r) => r.id === selectedRecipient?.id),
              0,
            ),
          ).base,
          className,
        )}
      >
        {selectedRecipient?.email ? (
          <span className="flex-1 text-left truncate">
            {selectedRecipient?.name
              ? `${selectedRecipient?.name} (${selectedRecipient?.email})`
              : selectedRecipient?.email}
          </span>
        ) : (
          <span className="flex-1 text-left truncate">Select recipient</span>
        )}

        <ChevronsUpDown className="ml-2 w-4 h-4" />
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-1 w-full rounded-md border shadow-lg bg-popover z-[50000]">
          <Command value={selectedRecipient?.email || ''}>
            <CommandInput placeholder="Search recipient..." />
            <CommandList>
              {recipients.length === 0 && (
                <CommandEmpty>
                  <span className="inline-block px-4 text-muted-foreground">
                    No recipient found.
                  </span>
                </CommandEmpty>
              )}

              {recipientsByRoleToDisplay().map(
                ([role, roleRecipients], roleIndex) => (
                  <CommandGroup key={roleIndex}>
                    <div className="mt-2 mb-1 ml-2 text-xs font-medium text-muted-foreground">
                      {role}
                    </div>

                    {roleRecipients.length === 0  && (
                      <div
                        key={`${role}-empty`}
                        className="text-muted-foreground/80 px-4 pb-4 pt-2.5 text-center text-xs"
                      >
                        No recipients with this role
                      </div>
                    )}

                    {roleRecipients.map((recipient) => (
                      <CommandItem
                        key={recipient.signingOrder}
                        value={recipient.email}
                        onClick={() => {
                          onSelectedRecipientChange(recipient)
                          setOpen(false)
                        }}
                        className={cn(
                          'px-2 last:mb-1 [&:not(:first-child)]:mt-1 cursor-pointer',
                          getRecipientColorStyles(
                            Math.max(
                              recipients.findIndex((r) => r.signingOrder === recipient.signingOrder),
                              0,
                            ),
                          ).comboxBoxItem,
                          {
                            'text-popover-foreground':
                              recipient.sendStatus === 'SENT',
                          },
                        )}
                      >
                        <span
                          className={cn('truncate', {
                            'font-medium':
                              recipient.signingOrder === selectedRecipient?.signingOrder,
                          })}
                        >
                          {recipient.name
                            ? `${recipient.name} (${recipient.email})`
                            : recipient.email}
                        </span>
                        {recipient.signingOrder === selectedRecipient?.signingOrder && (
                          <Check className="ml-auto w-4 h-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ),
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
