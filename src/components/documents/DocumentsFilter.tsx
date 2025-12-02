'use client'

import { useMemo } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { ExtendedDocumentStatus } from '../common/extended-document-status'
import Link from 'next/link'
import { DocumentSearch } from '../documents/DocumentSearch';
import { DocumentsTableSenderFilter } from '../common/documents-table-sender-filter'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'


const statuses = [
  { value: 'ALL', label: 'All' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REJECTED', label: 'Rejected' }, 
]

const DocumentsFilter = ({ documents }: { documents: Document[] }) => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  // ✅ Extract period at top-level (with memo)
  const isPeriodSelectorValue = (value: string): value is string => {
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

    params.set('status', String(value))

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
    <div className="flex flex-col gap-4 p-4 xl:flex-row xl:justify-between xl:items-center">
        {/* status Tabs */}
      <Tabs
        value={findDocumentSearchParams.status || 'ALL'}
        // className='overflow-x-auto'
      >
        <TabsList className="
    flex items-center gap-1
    rounded-lg bg-gray-100 p-1
    overflow-x-auto whitespace-nowrap
    scrollbar-none
    [&::-webkit-scrollbar]:hidden
  ">
          {statuses.map((item, index) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              asChild
             className="
        flex-shrink-0 px-2 py-0.5
        sm:px-3 sm:py-1
        text-[11px] sm:text-xs md:text-sm
        font-medium capitalize
        rounded-md
        transition-all duration-150
        data-[state=active]:bg-blue-600
        data-[state=active]:text-white
        data-[state=active]:shadow
        data-[state=inactive]:text-gray-600
        hover:data-[state=inactive]:text-blue-600
        active:scale-95
      ">            
              <Link href={getTabHref(item.value)} className='capitalize hover:-translate-y-[1px]'>
                {item.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex flex-wrap gap-2 items-center xl:w-1/2">
        <div className="flex-1">
          <DocumentSearch initialValue={findDocumentSearchParams.query} />
        </div>

        {/* Sender Filter */}
        <div className='relative'>
          <DocumentsTableSenderFilter documents={documents} />
        </div>

        {/* Time Filter */}
        <div className='relative min-w-28 shrink-0'>
          <Select
            defaultValue={period}
            onValueChange={onPeriodChange}
          >
            <SelectTrigger
              className='hover:border-[#d1d5db] hover:bg-[#f9fafb] hover:-translate-y-[1px] cursor-pointer text-[#1F1F21] transition-all ease-in duration-200 placeholder:text-[#787878] rounded-lg bg-white text-sm font-medium shadow-[0px 1px 2px 0px #1018280D] border-[#EAECF0] focus:ring-[#3353F8]'
              iconClass="h-5 w-5 opacity-[100%] text-[#1F1F21] ml-2"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position='popper'>
              <SelectItem value='all' className="pr-5">All Time</SelectItem>
              <SelectItem value='7d' className="pr-5">Last 7 days</SelectItem>
              <SelectItem value='14d' className="pr-5">Last 14 days</SelectItem>
              <SelectItem value='30d' className="pr-5">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default DocumentsFilter
