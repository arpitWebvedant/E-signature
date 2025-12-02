'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { MultiSelectCombobox } from '../ui/multi-select-combobox'

type DocumentsTableSenderFilterProps = {
  documents: Document[]
}

// ✅ small hook to check if client is mounted
function useIsMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

export const DocumentsTableSenderFilter = ({
  documents,
}: DocumentsTableSenderFilterProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const isMounted = useIsMounted()

  // current query param values
  const senderIds = (searchParams?.get('senderIds') ?? '')
    .split(',')
    .filter((value) => value !== '')
    .map((id) => id.trim())

  // Extract unique senders from documents
  const members = useMemo(() => {
    const senderMap = new Map<
      string,
      { userId: number; name?: string; email: string }
    >()

    documents.forEach((doc) => {
      // Use the sender email as the unique identifier
      const senderEmail = doc.sender

      // Only add if not already in the map
      if (!senderMap.has(senderEmail)) {
        senderMap.set(senderEmail, {
          userId: doc.user?.id || parseInt(doc.id),
          name:
            doc.user?.name || doc.user?.fullName || doc.sender.split('@')[0],
          email: doc.sender,
        })
      }
    })

    return Array.from(senderMap.values())
  }, [documents])

  const comboBoxOptions = members.map((member) => ({
    label: member.name ?? member.email,
    value: member.userId.toString(),
  }))

  const onChange = (newSenderIds: string[]) => {
    if (!pathname) return

    const params = new URLSearchParams(searchParams?.toString())
    if (newSenderIds.length > 0) {
      params.set('senderIds', newSenderIds.join(','))
    } else {
      params.delete('senderIds')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <MultiSelectCombobox
      emptySelectionPlaceholder={
        <p className='font-normal text-muted-foreground'>
          <span className='text-muted-foreground/70'>Sender:</span> All
        </p>
      }
      enableClearAllButton
      inputPlaceholder='Search'
      loading={!isMounted}
      options={comboBoxOptions}
      selectedValues={senderIds}
      onChange={onChange}
    />
  )
}
