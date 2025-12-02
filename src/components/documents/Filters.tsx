'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { ExtendedDocumentStatus } from '../common/extended-document-status'

import { DocumentsTableSenderFilter } from '../common/documents-table-sender-filter'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

import { DocumentSearch } from './DocumentSearch'
import { DocumentStatus } from './DocumentStatus'

export const Filters = ({ documents }: { documents: Document[] }) => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // ✅ Extract period at top-level (with memo)
  const isPeriodSelectorValue = (value): value is string => {
    return ['', '7d', '14d', '30d'].includes(value as string)
  }

  const period = useMemo(() => {
    const p = searchParams?.get('period') ?? 'all'
    return isPeriodSelectorValue(p) ? p : 'all'
  }, [searchParams])

  const findDocumentSearchParams = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  )

  const getTabHref = (value: keyof typeof ExtendedDocumentStatus) => {
    const params = new URLSearchParams(searchParams)

    params.set('status', value)

    if (value === ExtendedDocumentStatus.ALL) {
      params.delete('status')
    }

    if (
      value === ExtendedDocumentStatus.INBOX &&
      findDocumentSearchParams.status === ExtendedDocumentStatus.INBOX
    ) {
      params.delete('status')
    }

    if (params.has('page')) {
      params.delete('page')
    }

    let path = pathname || '/'

    if (params.toString()) {
      path += `?${params.toString()}`
    }

    return path
  }

  const onPeriodChange = (newPeriod: string) => {
    if (!pathname) return

    const params = new URLSearchParams(searchParams?.toString())

    params.set('period', newPeriod)

    if (newPeriod === '' || newPeriod === 'all') {
      params.delete('period')
    }

    router.push(`${pathname}?${params.toString()}`, {
      scroll: false, // preventScrollReset replacement
    })
  }

  return (
    <div className='flex overflow-hidden flex-wrap gap-x-4 gap-y-6 justify-between mt-6'>
      {/* Status Tabs */}
      <Tabs
        value={findDocumentSearchParams.status || 'ALL'}
        className='overflow-x-auto'
      >
        <TabsList>
          {['PENDING', 'COMPLETED', 'DRAFT', 'ALL'].map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              asChild
              className='hover:text-foreground min-w-[60px]'
            >
              <Link href={getTabHref(value)}>
                <DocumentStatus inheritColor={true} showIcon={false} status={value} />
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className='flex flex-wrap gap-x-2 gap-y-4 justify-end'>
        {/* Search */}
        <div className='flex flex-wrap gap-x-2 gap-y-4 justify-between items-center w-64'>
          <DocumentSearch initialValue={findDocumentSearchParams.query} />
        </div>
        {/* Sender Filter */}
        <div className='relative'>
          <DocumentsTableSenderFilter documents={documents} />
        </div>

        {/* Time Filter */}
        <div className='flex flex-wrap gap-x-2 gap-y-4 justify-between items-center w-48'>
          <Select defaultValue={period} onValueChange={onPeriodChange}>
            <SelectTrigger className='max-w-[200px] text-muted-foreground'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position='popper'>
              <SelectItem value='all'>All Time</SelectItem>
              <SelectItem value='7d'>Last 7 days</SelectItem>
              <SelectItem value='14d'>Last 14 days</SelectItem>
              <SelectItem value='30d'>Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

    
      </div>
    </div>
  )
}
